import { copyFile, mkdir, mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import sample from '../../data';
import { gallerySchema } from './gallery-schema';
import { displayFacts } from './photo-facts';
import { extractPhotoFacts, parsePhotoFacts } from './photo-exif';

describe('photo facts', () => {
  it('reads camera metadata from a JPEG', async () => {
    const bytes = await readFile('tests/fixtures/camera.jpg');
    expect((await parsePhotoFacts(bytes)).camera).toBe('Test Camera');
  });

  it('reads missing camera facts from an image under public/images', async () => {
    const fixture = await readFile('tests/fixtures/camera.jpg');
    const root = await mkdtemp(join(tmpdir(), 'lumolog-exif-'));
    const imageDir = join(root, 'public', 'images');
    const cwd = vi.spyOn(process, 'cwd');
    try {
      await mkdir(imageDir, { recursive: true });
      await copyFile('tests/fixtures/camera.jpg', join(imageDir, 'camera.jpg'));
      cwd.mockReturnValue(root);
      expect(await extractPhotoFacts('/images/camera.jpg')).toEqual(await parsePhotoFacts(fixture));
      await expect(extractPhotoFacts('/images/../camera.jpg')).rejects.toThrow('Unsupported local image path');
    } finally {
      cwd.mockRestore();
      await rm(root, { recursive: true, force: true });
    }
  });

  it('fills missing camera facts while preferring manually entered values', () => {
    const gallery = gallerySchema.parse(sample);
    const photo = gallery.albums.find(album => album.id === 'coast')!.photos[0];
    const facts = displayFacts(photo, { camera: 'Different camera', lens: 'EXIF lens', iso: 200 });
    expect(facts.camera).toBe('lumolog 示例相机');
    expect(facts.lens).toBe('35 mm 定焦');
    expect(facts.iso).toBe('400');
    expect(displayFacts({ ...photo, camera: '', lens: undefined, iso: undefined }, { camera: 'EXIF camera', lens: 'EXIF lens', iso: 200 })).toMatchObject({
      camera: 'EXIF camera', lens: 'EXIF lens', iso: 200,
    });
  });
});
