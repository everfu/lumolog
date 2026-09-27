let cachedValue: string | undefined;
let cachedOrigins: string[] = [];

export function remoteImageOrigins(value = process.env.IMAGE_REMOTE_ORIGINS ?? ''): string[] {
  if (value === cachedValue) return cachedOrigins;
  if (!value.trim()) {
    cachedValue = value;
    cachedOrigins = [];
    return cachedOrigins;
  }
  const origins = [...new Set(value.split(',').map(part => {
    const origin = part.trim();
    let url: URL;
    try { url = new URL(origin); }
    catch { throw new Error(`Invalid IMAGE_REMOTE_ORIGINS entry: ${origin || '(empty)'}`); }
    if (url.protocol !== 'https:' || !url.hostname || url.username || url.password ||
      url.pathname !== '/' || url.search || url.hash || url.hostname.includes('*') ||
      (origin !== url.origin && origin !== `${url.origin}/`)) {
      throw new Error(`IMAGE_REMOTE_ORIGINS must contain exact HTTPS origins: ${origin || '(empty)'}`);
    }
    return url.origin;
  }))];
  cachedValue = value;
  cachedOrigins = origins;
  return origins;
}

export function isAllowedRemoteImage(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password && remoteImageOrigins().includes(url.origin);
  } catch { return false; }
}
