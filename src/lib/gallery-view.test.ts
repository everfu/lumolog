import { describe, expect, it } from 'vitest';
import sample from '../../data';
import { gallerySchema } from './gallery-schema';
import { albumsFor, pageOf, orderedAlbums, termsFor } from './gallery-view';

const gallery = gallerySchema.parse(sample);

describe('runtime gallery views', () => {
  it('preserves JSON order and paginates without losing a work', () => {
    const albums = orderedAlbums(gallery);
    expect(albums[0].id).toBe('snow-platform');
    expect(orderedAlbums({ ...gallery, albums: [...albums].reverse() })[0].id).toBe(albums.at(-1)?.id);
    expect(pageOf(albums, 1).albums).toHaveLength(12);
    expect(pageOf(albums, 2).albums).toHaveLength(1);
    expect(pageOf(albums, 1).albums.concat(pageOf(albums, 2).albums).map(album => album.id)).toEqual(albums.map(album => album.id));
  });

  it('updates category and tag views from the same data', () => {
    const categories = termsFor(gallery, 'categories');
    const travel = categories.find(term => term.name === '旅行日记');
    expect(travel?.albums.map(album => album.id)).toEqual(albumsFor(gallery, 'categories', '旅行日记').map(album => album.id));
    expect(termsFor(gallery, 'tags').some(term => term.name === '海岸')).toBe(true);
  });
});
