import type { Metadata } from 'next';
import { GalleryPage, pageNumber } from '@/components/gallery-page';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ page?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = decodeURIComponent((await params).slug);
  return { title: slug };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const slug = decodeURIComponent((await params).slug);
  const page = pageNumber((await searchParams).page);
  return <GalleryPage page={page} title={slug} kind="categories" term={slug} className="is-term" />;
}
