import { lookup } from 'node:dns/promises';
import { open } from 'node:fs/promises';
import { isIP } from 'node:net';
import { join } from 'node:path';
import { parse as parseExif } from 'exifr/dist/full.esm.mjs';

export type ExtractedFacts = {
  camera?: string; lens?: string; focal_length?: string; aperture?: string;
  shutter?: string; iso?: string | number; taken?: string;
};

const MAX_READ_BYTES = 1024 * 1024;
const localImageUrl = /^\/images\/[a-zA-Z0-9/_-]+\.(?:jpe?g|png|webp|avif)$/;

function publicIp(ip: string) {
  if (isIP(ip) === 4) {
    const [a, b] = ip.split('.').map(Number);
    return !(a === 0 || a === 10 || a === 127 || a >= 224 ||
      (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) || (a === 192 && (b === 168 || b === 0)) ||
      (a === 198 && (b === 18 || b === 19)));
  }
  if (isIP(ip) === 6) {
    const lower = ip.toLowerCase();
    return !(lower === '::' || lower === '::1' || lower.startsWith('fc') || lower.startsWith('fd') ||
      lower.startsWith('fe8') || lower.startsWith('fe9') || lower.startsWith('fea') || lower.startsWith('feb') ||
      lower.startsWith('::ffff:127.') || lower.startsWith('::ffff:10.') || lower.startsWith('::ffff:192.168.'));
  }
  return false;
}

async function assertPublicHttps(url: URL) {
  if (url.protocol !== 'https:' || url.username || url.password || url.port) throw new Error('Unsupported metadata URL');
  const addresses = await lookup(url.hostname, { all: true });
  if (!addresses.length || addresses.some(address => !publicIp(address.address))) throw new Error('Private metadata host');
}

async function fetchImageHead(source: string): Promise<Uint8Array> {
  let url = new URL(source);
  for (let redirect = 0; redirect < 3; redirect++) {
    await assertPublicHttps(url);
    const response = await fetch(url, {
      cache: 'no-store', redirect: 'manual',
      headers: { Range: `bytes=0-${MAX_READ_BYTES - 1}`, Accept: 'image/*' },
      signal: AbortSignal.timeout(4000),
    });
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (!location) throw new Error('Invalid image redirect');
      url = new URL(location, url);
      continue;
    }
    if (!response.ok || !response.body) throw new Error('Image unavailable');
    const contentType = response.headers.get('content-type') ?? '';
    if (!/^image\/(?:jpeg|png|webp|avif|tiff)(?:;|$)/i.test(contentType)) throw new Error('Unsupported image type');
    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let size = 0;
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > MAX_READ_BYTES) break;
        chunks.push(value);
      }
    } finally { await reader.cancel().catch(() => {}); }
    return Buffer.concat(chunks);
  }
  throw new Error('Too many image redirects');
}

async function readLocalImageHead(source: string): Promise<Uint8Array> {
  if (!localImageUrl.test(source)) throw new Error('Unsupported local image path');
  const file = await open(join(process.cwd(), 'public', source.slice(1)), 'r');
  try {
    const bytes = Buffer.allocUnsafe(MAX_READ_BYTES);
    let size = 0;
    while (size < MAX_READ_BYTES) {
      const { bytesRead } = await file.read(bytes, size, MAX_READ_BYTES - size, size);
      if (bytesRead === 0) break;
      size += bytesRead;
    }
    return bytes.subarray(0, size);
  } finally {
    await file.close();
  }
}

function shutter(value: unknown): string | undefined {
  if (typeof value === 'string') return value.replace(/s$/, '');
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return value < 1 ? `1/${Math.round(1 / value)}` : String(value);
  }
}

function text(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

export async function parsePhotoFacts(bytes: Uint8Array): Promise<ExtractedFacts> {
  const data = await parseExif(bytes) as Record<string, unknown> | undefined;
  if (!data) return {};
  const taken = data.DateTimeOriginal ?? data.CreateDate ?? data.DateTime;
  return {
    camera: text(data.Model),
    lens: text(data.LensModel),
    focal_length: typeof data.FocalLength === 'number' ? `${data.FocalLength} mm` : text(data.FocalLength),
    aperture: typeof data.FNumber === 'number' ? String(data.FNumber) : text(data.FNumber),
    shutter: shutter(data.ExposureTime),
    iso: typeof data.ISO === 'number' || typeof data.ISO === 'string' ? data.ISO : undefined,
    taken: taken instanceof Date ? taken.toISOString().slice(0, 16).replace('T', ' ') : text(taken),
  };
}

export async function extractPhotoFacts(source: string): Promise<ExtractedFacts> {
  if (source.startsWith('https://')) return parsePhotoFacts(await fetchImageHead(source));
  if (source.startsWith('/images/')) return parsePhotoFacts(await readLocalImageHead(source));
  return {};
}
