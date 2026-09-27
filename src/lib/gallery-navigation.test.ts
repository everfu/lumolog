import { describe, expect, it } from 'vitest';
import data from '../../data';
import { moveSelection } from './gallery-navigation';

describe('lightbox navigation', () => {
  it('moves within a group, then across loaded groups', () => {
    const albums = data.albums.slice(0, 5);
    expect(moveSelection(albums, { albumIndex: 3, photoIndex: 0 }, 1)).toEqual({ albumIndex: 3, photoIndex: 1 });
    expect(moveSelection(albums, { albumIndex: 3, photoIndex: 1 }, 1)).toEqual({ albumIndex: 4, photoIndex: 0 });
    expect(moveSelection(albums, { albumIndex: 4, photoIndex: 0 }, -1)).toEqual({ albumIndex: 3, photoIndex: 1 });
  });

  it('wraps at both ends of the loaded list', () => {
    const albums = data.albums.slice(0, 4);
    expect(moveSelection(albums, { albumIndex: 3, photoIndex: 1 }, 1)).toEqual({ albumIndex: 0, photoIndex: 0 });
    expect(moveSelection(albums, { albumIndex: 0, photoIndex: 0 }, -1)).toEqual({ albumIndex: 3, photoIndex: 1 });
  });
});
