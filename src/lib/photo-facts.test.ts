import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import sample from '../../data/gallery.json';
import { gallerySchema } from './gallery-schema';
import { displayFacts } from './photo-facts';
import { parsePhotoFacts } from './photo-exif';

describe('photo facts', () => {
  it('reads camera metadata from a JPEG', async () => {
    const bytes = await readFile('tests/fixtures/camera.jpg');
    expect((await parsePhotoFacts(bytes)).camera).toBe('Test Camera');
  });

  it('prefers JSON values over extracted EXIF', () => {
    const gallery = gallerySchema.parse(sample);
    const photo = gallery.albums.find(album => album.id === 'coast')!.photos[0];
    const facts = displayFacts(photo, { camera: 'Different camera', lens: 'EXIF lens', iso: 200 });
    expect(facts.camera).toBe('lumolog 示例相机');
    expect(facts.lens).toBe('35 mm 定焦');
    expect(facts.iso).toBe('400');
  });
});
