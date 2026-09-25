import { NextResponse } from 'next/server';
import { getGallery } from '@/lib/gallery-source';
import { extractPhotoFacts } from '@/lib/photo-exif';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(_request: Request, { params }: { params: Promise<{ albumId: string; photoId: string }> }) {
  try {
    const { albumId, photoId } = await params;
    const gallery = await getGallery();
    const album = gallery.albums.find(item => item.id === albumId);
    const photo = album?.photos.find(item => item.id === photoId);
    if (!photo) return NextResponse.json({ error: 'Photo not found' }, { status: 404, headers: { 'Cache-Control': 'no-store' } });
    let facts = {};
    const factFields = ['camera', 'lens', 'focal_length', 'aperture', 'shutter', 'iso', 'taken'] as const;
    if (factFields.some(field => !photo[field])) {
      try { facts = await extractPhotoFacts(photo.metadataSrc ?? photo.src); }
      catch (error) { console.info('EXIF unavailable:', error); }
    }
    return NextResponse.json({ facts }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Metadata API unavailable:', error);
    return NextResponse.json({ facts: {} }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
