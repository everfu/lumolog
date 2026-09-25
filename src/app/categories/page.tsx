import Link from 'next/link';
import { GalleryUnavailable } from '@/components/gallery-unavailable';
import { PageFrame } from '@/components/page-frame';
import { getGallery } from '@/lib/gallery-source';
import { termsFor, termUrl } from '@/lib/gallery-view';

export const dynamic = 'force-dynamic';

export default async function CategoriesPage() {
  let gallery;
  try { gallery = await getGallery(); }
  catch (error) { console.error('Gallery unavailable:', error); return <GalleryUnavailable />; }
  const terms = termsFor(gallery, 'categories');
  return <PageFrame gallery={gallery} className="is-inner"><section className="term-index" aria-labelledby="term-title"><p className="eyebrow">EXPLORE</p><h1 id="term-title">分类</h1><p>沿着不同的线索，重新发现这些瞬间。</p><div className="term-list">{terms.map(term => <Link key={term.name} href={termUrl('categories', term.name)}><span>{term.name}</span><small>{term.albums.length} 组作品</small></Link>)}</div></section></PageFrame>;
}
