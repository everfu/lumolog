import { GalleryPage, pageNumber } from '@/components/gallery-page';

export const dynamic = 'force-dynamic';

export default async function PhotosPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const page = pageNumber((await searchParams).page);
  return <GalleryPage page={page} title="全部作品" intro="把路上遇见的光，一张张收藏。" className="is-inner" fallbackBase="/photos/" />;
}
