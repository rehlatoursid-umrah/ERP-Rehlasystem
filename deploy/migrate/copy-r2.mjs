// Copies every object from the old Cloudflare R2 bucket into FILES_DIR,
// keeping the same key (e.g. documents/<uuid>-ktp.jpg). Read-only on R2.
// Re-runnable: objects already present with the same size are skipped.
//
// Env: R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, FILES_DIR
import { createHash } from 'node:crypto';
import { mkdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { GetObjectCommand, ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3';

const filesDir = path.resolve(process.env.FILES_DIR || '/data/files');
const bucket = process.env.R2_BUCKET_NAME;
const s3 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

let total = 0;
let copied = 0;
let skipped = 0;
let bytes = 0;
const manifest = [];
let token;

do {
  const page = await s3.send(new ListObjectsV2Command({ Bucket: bucket, ContinuationToken: token }));
  for (const object of page.Contents ?? []) {
    total++;
    const target = path.resolve(filesDir, object.Key);
    if (!target.startsWith(filesDir + path.sep)) throw new Error(`Unsafe key: ${object.Key}`);

    const existing = await stat(target).catch(() => null);
    if (existing?.isFile() && existing.size === object.Size) {
      skipped++;
      bytes += object.Size;
      manifest.push({ key: object.Key, size: object.Size, status: 'skipped' });
      continue;
    }

    const response = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: object.Key }));
    const body = Buffer.from(await response.Body.transformToByteArray());
    if (body.length !== object.Size) throw new Error(`Size mismatch for ${object.Key}`);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, body, { mode: 0o640 });
    copied++;
    bytes += body.length;
    manifest.push({ key: object.Key, size: body.length, sha256: createHash('sha256').update(body).digest('hex'), status: 'copied' });
  }
  token = page.IsTruncated ? page.NextContinuationToken : undefined;
} while (token);

// The manifest lists every key, so it goes to stdout (redirected to a private
// host file by migrate-data.sh) and never lands inside the served files directory.
process.stdout.write(JSON.stringify(manifest, null, 2) + '\n');
console.error(JSON.stringify({ total, copied, skipped, megabytes: +(bytes / 1048576).toFixed(1) }));
