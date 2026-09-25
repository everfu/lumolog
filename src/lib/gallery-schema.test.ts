import { describe, expect, it } from 'vitest';
import sample from '../../data/gallery.json';
import { gallerySchema } from './gallery-schema';

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
});
