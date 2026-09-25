import type { Gallery } from '@/lib/gallery-schema';
import { termsFor } from '@/lib/gallery-view';
import { SiteHeader } from './site-header';

export function PageFrame({ gallery, children, className = '' }: { gallery?: Gallery; children: React.ReactNode; className?: string }) {
  const categories = gallery ? termsFor(gallery, 'categories').map(term => term.name) : [];
  return <><main id="main-content" className={className}>{children}</main><SiteHeader categories={categories} /></>;
}
