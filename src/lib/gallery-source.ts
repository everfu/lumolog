import { cache } from 'react';
import sample from '../../data';
import { gallerySchema, type Gallery } from './gallery-schema';

const MAX_JSON_BYTES = 2 * 1024 * 1024;

export class GalleryUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GalleryUnavailableError';
  }
}

async function readLimited(response: Response): Promise<string> {
  const declaredLength = Number(response.headers.get('content-length'));
  if (declaredLength > MAX_JSON_BYTES) throw new GalleryUnavailableError('JSON is too large');
  if (!response.body) throw new GalleryUnavailableError('JSON response has no body');
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_JSON_BYTES) throw new GalleryUnavailableError('JSON is too large');
      chunks.push(value);
    }
  } finally {
    await reader.cancel().catch(() => {});
  }
  return new TextDecoder('utf-8', { fatal: true }).decode(Buffer.concat(chunks));
}

async function loadGallery(): Promise<Gallery> {
  const source = process.env.GALLERY_JSON_URL;
  let raw: unknown;
  if (!source) {
    raw = sample;
  } else {
    let url: URL;
    try { url = new URL(source); }
    catch { throw new GalleryUnavailableError('GALLERY_JSON_URL is invalid'); }
    if (url.protocol !== 'https:' && !(url.protocol === 'http:' && (url.hostname === '127.0.0.1' || url.hostname === 'localhost'))) {
      throw new GalleryUnavailableError('GALLERY_JSON_URL must use HTTPS');
    }
    try {
      const response = await fetch(url, {
        cache: 'no-store',
        headers: { Accept: 'application/json', 'Cache-Control': 'no-cache' },
        signal: AbortSignal.timeout(5000),
      });
      if (!response.ok) throw new GalleryUnavailableError(`JSON source returned ${response.status}`);
      raw = JSON.parse(await readLimited(response));
    } catch (error) {
      if (error instanceof GalleryUnavailableError) throw error;
      throw new GalleryUnavailableError(`Unable to fetch gallery JSON: ${error instanceof Error ? error.message : 'unknown error'}`);
    }
  }
  const parsed = gallerySchema.safeParse(raw);
  if (!parsed.success) throw new GalleryUnavailableError(`Invalid gallery data: ${parsed.error.issues[0]?.message ?? 'unknown schema error'}`);
  return parsed.data;
}

// React cache deduplicates reads within one server render. The remote fetch itself is uncached.
export const getGallery = cache(loadGallery);
