import { GalleryUnavailable } from '@/components/gallery-unavailable';
import { PageFrame } from '@/components/page-frame';
import { TagTile } from '@/components/tag-tile';
import { getGallery } from '@/lib/gallery-source';
import { termsFor } from '@/lib/gallery-view';

export const dynamic = 'force-dynamic';

export default async function TagsPage() {
  let gallery;
  try { gallery = await getGallery(); }
  catch (error) { console.error('Gallery unavailable:', error); return <GalleryUnavailable />; }
  const terms = termsFor(gallery, 'tags');
  return <PageFrame gallery={gallery} className="is-inner"><section className="tag-index" aria-labelledby="tag-title"><h1 id="tag-title" className="visually-hidden">标签</h1><div className="tag-grid">
    {terms.map((term, index) => <TagTile key={`${term.name}:${term.albums[0].photos[0].thumb ?? term.albums[0].photos[0].src}`} name={term.name} albums={term.albums} index={index} />)}
  </div></section></PageFrame>;
}
