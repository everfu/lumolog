import type { MetadataRoute } from 'next';
import { getGallery } from '@/lib/gallery-source';
import { termsFor, termUrl } from '@/lib/gallery-view';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
  const gallery = await getGallery();
  return [
    { url: `${base}/`, lastModified: new Date() },
    { url: `${base}/photos/`, lastModified: new Date() },
    { url: `${base}/categories/`, lastModified: new Date() },
    { url: `${base}/tags/`, lastModified: new Date() },
    ...termsFor(gallery, 'categories').map(term => ({ url: `${base}${termUrl('categories', term.name)}`, lastModified: new Date(term.albums[0].date) })),
    ...termsFor(gallery, 'tags').map(term => ({ url: `${base}${termUrl('tags', term.name)}`, lastModified: new Date(term.albums[0].date) })),
  ];
}
