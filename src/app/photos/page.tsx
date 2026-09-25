import { GalleryUnavailable } from '@/components/gallery-unavailable';
import { GalleryWall } from '@/components/gallery-wall';
import { PageFrame } from '@/components/page-frame';
import { getGallery } from '@/lib/gallery-source';
import { pageOf, orderedAlbums } from '@/lib/gallery-view';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function PhotosPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const page = Number((await searchParams).page ?? 1);
  if (!Number.isInteger(page) || page < 1) notFound();
  let gallery;
  try { gallery = await getGallery(); }
  catch (error) { console.error('Gallery unavailable:', error); return <GalleryUnavailable />; }
  const albums = orderedAlbums(gallery);
  const paged = pageOf(albums, page);
  if (page > paged.totalPages) notFound();
  return <PageFrame gallery={gallery} className="is-inner"><GalleryWall initialAlbums={paged.albums} total={albums.length} title="全部作品" intro="把路上遇见的光，一张张收藏。" page={page} fallbackBase="/photos/" /></PageFrame>;
}
