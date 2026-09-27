'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Album } from '@/lib/gallery-schema';
import { termUrl } from '@/lib/gallery-view';

export function GalleryCard({ album, index, onOpen }: { album: Album; index: number; onOpen: (source: HTMLButtonElement) => void }) {
  const cover = album.photos[0];
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
  return <article className={`gallery-card${loaded ? ' is-loaded' : ''}`}>
    <button className="gallery-cover" type="button" aria-label={`查看${album.title}的照片`} onClick={event => onOpen(event.currentTarget)}>
      <Image ref={image} src={src} alt={cover.alt} fill sizes="(max-width: 620px) 100vw, (max-width: 900px) 50vw, (max-width: 1680px) 33vw, 25vw" preload={index === 0} loading={index === 0 ? undefined : 'lazy'} decoding="async" unoptimized={src === '/images/photo-fallback.svg'} onLoad={() => setLoaded(true)} onError={() => { if (src !== '/images/photo-fallback.svg') { setLoaded(false); setSrc('/images/photo-fallback.svg'); } else setLoaded(true); }} />
      <span className="card-shade" /><span className="card-bottom"><span className="card-title">{album.title}</span></span>
    </button>
    {album.categories[0] && <Link className="card-category" href={termUrl('categories', album.categories[0])}>{album.categories[0]}</Link>}
  </article>;
}
