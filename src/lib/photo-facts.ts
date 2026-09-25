import type { Photo } from './gallery-schema';

export type CameraFacts = { camera?: string; lens?: string; focal_length?: string; aperture?: string; shutter?: string; iso?: string | number; taken?: string };

export function displayFacts(photo: Photo, extracted: CameraFacts) {
  return {
    camera: photo.camera || extracted.camera || '',
    lens: photo.lens || extracted.lens || '',
    focal: photo.focal_length || extracted.focal_length || '',
    aperture: photo.aperture || extracted.aperture || '',
    shutter: photo.shutter || extracted.shutter || '',
    iso: photo.iso || extracted.iso || '',
    taken: photo.taken || extracted.taken || '',
  };
}
