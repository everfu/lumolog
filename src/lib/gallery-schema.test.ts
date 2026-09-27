import { afterEach, describe, expect, it, vi } from 'vitest';
import sample from '../../data';
import { gallerySchema } from './gallery-schema';
import { remoteImageOrigins } from './image-origins';

afterEach(() => vi.unstubAllEnvs());

describe('gallery data contract', () => {
  it('accepts the migrated local gallery', () => {
    const gallery = gallerySchema.parse(sample);
    expect(gallery.albums).toHaveLength(13);
    expect(gallery.albums.reduce((sum, album) => sum + album.photos.length, 0)).toBe(14);
  });

  it('rejects duplicate IDs and incomplete map coordinates', () => {
    const duplicate = structuredClone(sample);
    duplicate.albums[1].id = duplicate.albums[0].id;
    expect(gallerySchema.safeParse(duplicate).success).toBe(false);

    const incomplete = structuredClone(sample) as unknown as { albums: { photos: { lat?: number }[] }[] };
    incomplete.albums[0].photos[0].lat = 12;
    expect(gallerySchema.safeParse(incomplete).success).toBe(false);
  });

  it('rejects non-HTTPS remote images and unsupported versions', () => {
    const insecure = structuredClone(sample);
    insecure.albums[0].photos[0].src = 'http://example.com/photo.jpg';
    expect(gallerySchema.safeParse(insecure).success).toBe(false);
    expect(gallerySchema.safeParse({ ...sample, version: 2 }).success).toBe(false);
  });

  it('only accepts image sources from configured HTTPS origins', () => {
    const remote = structuredClone(sample);
    remote.albums[0].photos[0].src = 'https://photos.example.com/full.jpg?token=abc';
    remote.albums[0].photos[0].thumb = 'https://photos.example.com/thumb.jpg';
    expect(gallerySchema.safeParse(remote).success).toBe(false);
    vi.stubEnv('IMAGE_REMOTE_ORIGINS', 'https://photos.example.com,https://other.example.com');
    expect(gallerySchema.safeParse(remote).success).toBe(true);
    remote.albums[0].photos[0].thumb = 'https://unlisted.example.com/thumb.jpg';
    expect(gallerySchema.safeParse(remote).success).toBe(false);
  });

  it('rejects wildcard and malformed image origin configuration', () => {
    expect(() => remoteImageOrigins('https://*.example.com')).toThrow('IMAGE_REMOTE_ORIGINS');
    expect(() => remoteImageOrigins('http://photos.example.com')).toThrow('IMAGE_REMOTE_ORIGINS');
    expect(() => remoteImageOrigins('https://photos.example.com/path')).toThrow('IMAGE_REMOTE_ORIGINS');
  });
});
