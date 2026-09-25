'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { Album } from '@/lib/gallery-schema';
import { termUrl } from '@/lib/gallery-view';

export function GalleryCard({ album, index, onOpen }: { album: Album; index: number; onOpen: () => void }) {
  const [loaded, setLoaded] = useState(false);
  const image = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const img = image.current;
    if (img?.complete) {
      // Both successful and failed loads can finish before React hydrates the card.
      if (img.naturalWidth === 0) {
        img.dataset.failed = 'true';
        img.src = '/images/photo-fallback.svg';
      }
      setLoaded(true);
    }
  }, []);
  const cover = album.photos[0];
  return <article className={`gallery-card${loaded ? ' is-loaded' : ''}`}>
    <button className="gallery-open" type="button" aria-label={`查看${album.title}的照片`} onClick={onOpen}>
      <img ref={image} src={cover.thumb ?? cover.src} alt={cover.alt} loading={index < 4 ? 'eager' : 'lazy'} fetchPriority={index === 0 ? 'high' : undefined} decoding="async" onLoad={() => setLoaded(true)} onError={event => { const img = event.currentTarget; if (!img.dataset.failed) { img.dataset.failed = 'true'; img.src = '/images/photo-fallback.svg'; } setLoaded(true); }} />
      <span className="card-shade" /><span className="card-bottom"><span className="card-title">{album.title}</span></span>
    </button>
    {album.categories[0] && <Link className="card-category" href={termUrl('categories', album.categories[0])}>{album.categories[0]}</Link>}
  </article>;
}
