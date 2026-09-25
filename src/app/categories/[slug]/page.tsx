import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { GalleryUnavailable } from '@/components/gallery-unavailable';
import { GalleryWall } from '@/components/gallery-wall';
import { PageFrame } from '@/components/page-frame';
import { getGallery } from '@/lib/gallery-source';
import { albumsFor, pageOf, termsFor, termUrl } from '@/lib/gallery-view';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ page?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = decodeURIComponent((await params).slug);
  return { title: slug };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const slug = decodeURIComponent((await params).slug);
  const page = Number((await searchParams).page ?? 1);
  if (!Number.isInteger(page) || page < 1) notFound();
  let gallery;
  try { gallery = await getGallery(); }
  catch (error) { console.error('Gallery unavailable:', error); return <GalleryUnavailable />; }
  if (!termsFor(gallery, 'categories').some(term => term.name === slug)) notFound();
  const albums = albumsFor(gallery, 'categories', slug);
  const paged = pageOf(albums, page);
  if (page > paged.totalPages) notFound();
  return <PageFrame gallery={gallery} className="is-term"><GalleryWall initialAlbums={paged.albums} total={albums.length} title={slug} kind="categories" term={slug} page={page} fallbackBase={termUrl('categories', slug)} /></PageFrame>;
}
