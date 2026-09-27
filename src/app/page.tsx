import { GalleryPage, pageNumber } from '@/components/gallery-page';

export const dynamic = 'force-dynamic';

export default async function HomePage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const page = pageNumber((await searchParams).page);
  return <GalleryPage page={page} title="全部作品" intro="以照片记录路途、城市与自然。" className="is-home" fallbackBase="/" />;
}
