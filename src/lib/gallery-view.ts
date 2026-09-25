import type { Album, Gallery } from './gallery-schema';

export const PAGE_SIZE = 12;

export function orderedAlbums(gallery: Gallery): Album[] {
  return gallery.albums;
}

export function albumsFor(gallery: Gallery, kind?: 'categories' | 'tags', term?: string): Album[] {
  const albums = orderedAlbums(gallery);
  if (!kind || !term) return albums;
  return albums.filter(album => album[kind].includes(term));
}

export function termsFor(gallery: Gallery, kind: 'categories' | 'tags') {
  const grouped = new Map<string, Album[]>();
  for (const album of orderedAlbums(gallery)) {
    for (const term of new Set(album[kind])) grouped.set(term, [...(grouped.get(term) ?? []), album]);
  }
  return [...grouped].sort(([a], [b]) => a.localeCompare(b, 'zh-CN')).map(([name, albums]) => ({ name, albums }));
}

export function pageOf(albums: Album[], page: number) {
  const totalPages = Math.max(1, Math.ceil(albums.length / PAGE_SIZE));
  return { albums: albums.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), totalPages };
}

export function termUrl(kind: 'categories' | 'tags', name: string) {
  return `/${kind}/${encodeURIComponent(name)}/`;
}
