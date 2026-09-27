'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Album } from '@/lib/gallery-schema';
import { termUrl } from '@/lib/gallery-view';

export function TagTile({ name, albums, index }: { name: string; albums: Album[]; index: number }) {
  const cover = albums[0].photos[0];
  const [src, setSrc] = useState(cover.thumb ?? cover.src);
  const [loaded, setLoaded] = useState(false);
  const image = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const img = image.current;
    if (img?.complete) {
      if (img.naturalWidth === 0 && src !== '/images/photo-fallback.svg') setSrc('/images/photo-fallback.svg');
      else setLoaded(true);
    }
  }, [src]);
  useEffect(() => {
    if (index !== 0) return;
    const section = image.current?.closest('.tag-index');
    section?.classList.add('is-loading-enhanced');
    return () => section?.classList.remove('is-loading-enhanced');
  }, [index]);
  return <Link className={`tag-tile${loaded ? ' is-loaded' : ''}`} href={termUrl('tags', name)} aria-label={`${name}，${albums.length} 组作品`}>
    <Image ref={image} src={src} alt="" fill sizes="(max-width: 620px) 100vw, (max-width: 900px) 50vw, 33vw" loading={index === 0 ? 'eager' : 'lazy'} decoding="async" unoptimized={src === '/images/photo-fallback.svg'} onLoad={() => setLoaded(true)} onError={() => { if (src !== '/images/photo-fallback.svg') { setLoaded(false); setSrc('/images/photo-fallback.svg'); } else setLoaded(true); }} />
    <span className="tag-tile-shade" aria-hidden="true" />
    {index === 0 && <span className="tag-page-badge">标签</span>}
    <span className="tag-tile-count">{albums.length} 组作品</span><span className="tag-tile-name">{name}</span>
  </Link>;
}
