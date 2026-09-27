import { notFound } from 'next/navigation';
import { GalleryUnavailable } from './gallery-unavailable';
import { GalleryWall } from './gallery-wall';
import { PageFrame } from './page-frame';
import { getGallery } from '@/lib/gallery-source';
import { albumsFor, pageOf, termUrl } from '@/lib/gallery-view';

type TermKind = 'categories' | 'tags';

export function pageNumber(value?: string): number {
  const page = Number(value ?? 1);
  if (!Number.isSafeInteger(page) || page < 1) notFound();
  return page;
}

export async function GalleryPage({ page, title, intro, kind, term, fallbackBase, className }: {
  page: number;
  title: string;
  intro?: string;
  kind?: TermKind;
  term?: string;
  fallbackBase?: string;
  className: string;
}) {
  let gallery;
  try { gallery = await getGallery(); }
  catch (error) { console.error('Gallery unavailable:', error); return <GalleryUnavailable />; }

  const albums = albumsFor(gallery, kind, term);
  const paged = pageOf(albums, page);
  if ((kind && !albums.length) || page > paged.totalPages) notFound();

  return <PageFrame gallery={gallery} className={className}>
    <GalleryWall initialAlbums={paged.albums} total={albums.length} title={title} intro={intro} kind={kind} term={term} page={page} fallbackBase={fallbackBase ?? (kind && term ? termUrl(kind, term) : '/')} />
  </PageFrame>;
}
