import { afterEach, describe, expect, it, vi } from 'vitest';
import localData from '../../data';
import { getGallery } from './gallery-source';

afterEach(() => vi.unstubAllEnvs());

describe('gallery source', () => {
  it('uses local data when no remote URL is configured', async () => {
    vi.stubEnv('GALLERY_JSON_URL', '');
    expect((await getGallery()).albums.map(album => album.id)).toEqual(localData.albums.map(album => album.id));
  });

  it('keeps remote JSON as a complete override', async () => {
    const remoteData = { ...localData, albums: [localData.albums[0]] };
    vi.stubEnv('GALLERY_JSON_URL', 'https://example.com/gallery.json');
    const fetchImage = vi.spyOn(globalThis, 'fetch').mockResolvedValue(Response.json(remoteData));
    try {
      const gallery = await getGallery();
      expect(gallery.albums).toHaveLength(1);
      expect(gallery.albums[0].id).toBe(localData.albums[0].id);
      expect(fetchImage).toHaveBeenCalledOnce();
    } finally {
      fetchImage.mockRestore();
    }
  });

  it('reads updated remote JSON on the next request', async () => {
    vi.stubEnv('GALLERY_JSON_URL', 'https://example.com/gallery.json');
    const first = { ...localData, albums: [localData.albums[0]] };
    const second = { ...localData, albums: [localData.albums[1]] };
    const fetchImage = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(Response.json(first))
      .mockResolvedValueOnce(Response.json(second));
    try {
      expect((await getGallery()).albums[0].id).toBe(first.albums[0].id);
      expect((await getGallery()).albums[0].id).toBe(second.albums[0].id);
      expect(fetchImage).toHaveBeenCalledTimes(2);
    } finally {
      fetchImage.mockRestore();
    }
  });
});
