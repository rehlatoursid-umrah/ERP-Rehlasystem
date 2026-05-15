import { NextResponse } from 'next/server';

// Public API: Upload a file to R2 immediately (for KTP/Passport previews)
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'uploads';

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'File terlalu besar (maks 5MB)' }, { status: 400 });
    }

    const { uploadFileToR2 } = await import('@/app/lib/s3');
    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadFileToR2(buffer, file.name || 'file.jpg', file.type || 'image/jpeg', folder);

    return NextResponse.json({ success: true, url });
  } catch (error: any) {
    console.error('Upload API error:', error);
    return NextResponse.json({ success: false, error: 'Gagal mengunggah file' }, { status: 500 });
  }
}
