import { GalleryUnavailable } from '@/components/gallery-unavailable';
import { GalleryWall } from '@/components/gallery-wall';
import { PageFrame } from '@/components/page-frame';
import { getGallery } from '@/lib/gallery-source';
import { pageOf, orderedAlbums } from '@/lib/gallery-view';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function HomePage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const page = Number((await searchParams).page ?? 1);
  if (!Number.isInteger(page) || page < 1) notFound();
  let gallery;
  try { gallery = await getGallery(); }
  catch (error) { console.error('Gallery unavailable:', error); return <GalleryUnavailable />; }
  const albums = orderedAlbums(gallery);
  const paged = pageOf(albums, page);
  if (page > paged.totalPages) notFound();
  return <PageFrame gallery={gallery} className="is-home"><GalleryWall initialAlbums={paged.albums} total={albums.length} title="全部作品" intro="以照片记录路途、城市与自然。" page={page} fallbackBase="/" /></PageFrame>;
}
