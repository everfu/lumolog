import type { Album } from './gallery-schema';

export type GallerySelection = { albumIndex: number; photoIndex: number } | null;

export function moveSelection(albums: Album[], selection: GallerySelection, delta: -1 | 1): GallerySelection {
  if (!selection || !albums.length) return selection;
  const photoIndex = selection.photoIndex + delta;
  if (photoIndex >= 0 && photoIndex < albums[selection.albumIndex].photos.length) {
    return { ...selection, photoIndex };
  }
  const albumIndex = (selection.albumIndex + delta + albums.length) % albums.length;
  return {
    albumIndex,
    photoIndex: delta === 1 ? 0 : albums[albumIndex].photos.length - 1,
  };
}
