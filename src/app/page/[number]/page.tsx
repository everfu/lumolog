import { GalleryPage, pageNumber } from '@/components/gallery-page';

export const dynamic = 'force-dynamic';

export default async function PagedHome({ params }: { params: Promise<{ number: string }> }) {
  const page = pageNumber((await params).number);
  return <GalleryPage page={page} title="全部作品" intro="以照片记录路途、城市与自然。" className="is-home" fallbackBase="/" />;
}
