import { z } from 'zod';
import { isAllowedRemoteImage } from './image-origins';

const localImagePath = /^\/images\/[a-zA-Z0-9/_-]+\.(?:jpe?g|png|webp|avif)$/;
const imageUrl = z.string().refine(value => localImagePath.test(value) || isAllowedRemoteImage(value), {
  message: 'image must use /images/ or an origin listed in IMAGE_REMOTE_ORIGINS',
});
const metadataUrl = z.string().url().refine(value => {
  const url = new URL(value);
  return url.protocol === 'https:' && !url.username && !url.password;
}).or(z.string().regex(localImagePath));

const optionalText = z.string().trim().max(500).optional();
const id = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const date = z.iso.date();

export const photoSchema = z.strictObject({
  id,
  src: imageUrl,
  thumb: imageUrl.optional(),
  metadataSrc: metadataUrl.optional(),
  alt: z.string().trim().min(1).max(300),
  caption: optionalText,
  credit: z.strictObject({
    name: z.string().trim().min(1).max(150),
    url: z.url().refine(value => value.startsWith('https://')).optional(),
    license: optionalText,
  }).optional(),
  camera: optionalText,
  lens: optionalText,
  focal_length: optionalText,
  aperture: optionalText,
  shutter: optionalText,
  iso: z.union([z.string(), z.number()]).optional(),
  taken: optionalText,
  location: optionalText,
  lat: z.number().min(-90).max(90).optional(),
  lon: z.number().min(-180).max(180).optional(),
}).refine(photo => (photo.lat === undefined) === (photo.lon === undefined), {
  message: 'lat and lon must be provided together',
});

export const albumSchema = z.strictObject({
  id,
  title: z.string().trim().min(1).max(150),
  date,
  description: optionalText,
  categories: z.array(z.string().trim().min(1).max(80)).default([]),
  tags: z.array(z.string().trim().min(1).max(80)).default([]),
  location: optionalText,
  photos: z.array(photoSchema).min(1),
}).superRefine((album, ctx) => {
  const ids = new Set<string>();
  album.photos.forEach((photo, index) => {
    if (ids.has(photo.id)) ctx.addIssue({ code: 'custom', path: ['photos', index, 'id'], message: 'duplicate photo id' });
    ids.add(photo.id);
  });
});

export const gallerySchema = z.strictObject({
  version: z.literal(1),
  albums: z.array(albumSchema),
}).superRefine((gallery, ctx) => {
  const ids = new Set<string>();
  gallery.albums.forEach((album, index) => {
    if (ids.has(album.id)) ctx.addIssue({ code: 'custom', path: ['albums', index, 'id'], message: 'duplicate album id' });
    ids.add(album.id);
  });
});

export type Photo = z.infer<typeof photoSchema>;
export type Album = z.infer<typeof albumSchema>;
export type Gallery = z.infer<typeof gallerySchema>;
