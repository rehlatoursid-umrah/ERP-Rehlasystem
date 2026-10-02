import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

// Menyajikan file yang disimpan oleh app/lib/s3.ts (pengganti URL publik R2).
const FILES_DIR = path.resolve(process.env.FILES_DIR || path.join(process.cwd(), 'storage', 'files'));

const MIME_TYPES: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.heic': 'image/heic',
};

export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const segments = (await params).path;
  // Hidden files (".…") and traversal segments are never served.
  if (!segments?.length || segments.some((s) => !s || s.startsWith('.') || s.includes('\\'))) {
    return new Response('Not found', { status: 404 });
  }

  const target = path.resolve(FILES_DIR, ...segments);
  if (!target.startsWith(FILES_DIR + path.sep)) {
    return new Response('Not found', { status: 404 });
  }

  try {
    const info = await stat(target);
    if (!info.isFile()) return new Response('Not found', { status: 404 });
    const body = await readFile(target);
    const contentType = MIME_TYPES[path.extname(target).toLowerCase()] || 'application/octet-stream';
    return new Response(body, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(info.size),
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return new Response('Not found', { status: 404 });
  }
}
