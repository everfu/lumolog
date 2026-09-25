'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { Album } from '@/lib/gallery-schema';
import { termUrl } from '@/lib/gallery-view';

export function TagTile({ name, albums, index }: { name: string; albums: Album[]; index: number }) {
  const cover = albums[0].photos[0];
  const [src, setSrc] = useState(cover.thumb ?? cover.src);
  const image = useRef<HTMLImageElement>(null);
  useEffect(() => {
    if (image.current?.complete && image.current.naturalWidth === 0) {
      setSrc('/images/photo-fallback.svg');
    }
  }, []);
  return <Link className="tag-tile" href={termUrl('tags', name)} aria-label={`${name}，${albums.length} 组作品`}>
    <img ref={image} src={src} alt="" loading={index < 4 ? 'eager' : 'lazy'} decoding="async" onError={() => { if (src !== '/images/photo-fallback.svg') setSrc('/images/photo-fallback.svg'); }} />
    <span className="tag-tile-shade" aria-hidden="true" />
    {index === 0 && <span className="tag-page-badge">标签</span>}
    <span className="tag-tile-count">{albums.length} 组作品</span><span className="tag-tile-name">{name}</span>
  </Link>;
}
