import { NextRequest, NextResponse } from 'next/server';
import { getGallery } from '@/lib/gallery-source';
import { albumsFor, pageOf } from '@/lib/gallery-view';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const page = Number(request.nextUrl.searchParams.get('page') ?? 1);
  const kind = request.nextUrl.searchParams.get('kind');
  const term = request.nextUrl.searchParams.get('term');
  if (!Number.isInteger(page) || page < 1 || (kind && kind !== 'tags' && kind !== 'categories') || (kind && !term)) {
    return NextResponse.json({ error: 'Invalid query' }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
  }
  try {
    const gallery = await getGallery();
    const albums = albumsFor(gallery, kind as 'categories' | 'tags' | undefined, term ?? undefined);
    return NextResponse.json({ albums: pageOf(albums, page).albums, total: albums.length }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Gallery API unavailable:', error);
    return NextResponse.json({ error: 'Gallery unavailable' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
