'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Album } from '@/lib/gallery-schema';
import { moveSelection, type GallerySelection } from '@/lib/gallery-navigation';
import { PAGE_SIZE } from '@/lib/gallery-view';
import { GalleryCard } from './gallery-card';
import { Lightbox } from './lightbox';

export function GalleryWall({ initialAlbums, total, title, intro, kind, term, page = 1, fallbackBase }: {
  initialAlbums: Album[]; total: number; title: string; intro?: string; kind?: 'categories' | 'tags'; term?: string; page?: number; fallbackBase: string;
}) {
  const [albums, setAlbums] = useState(initialAlbums);
  const [nextPage, setNextPage] = useState(page + 1);
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [observerSupported, setObserverSupported] = useState(true);
  const [selection, setSelection] = useState<GallerySelection>(null);
  const openedFrom = useRef<HTMLButtonElement>(null);
  const sentinel = useRef<HTMLDivElement>(null);

  const move = useCallback((delta: -1 | 1) => {
    setSelection(current => moveSelection(albums, current, delta));
  }, [albums]);

  useEffect(() => {
    document.body.classList.add('is-loading-enhanced');
    // The IntersectionObserver API can only be detected in the browser.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setObserverSupported('IntersectionObserver' in window);
    return () => document.body.classList.remove('is-loading-enhanced');
  }, []);

  useEffect(() => {
    const element = sentinel.current;
    if (!element || failed || nextPage > Math.ceil(total / PAGE_SIZE) || !observerSupported) return;
    const controller = new AbortController();
    let inFlight = false;
    const observer = new IntersectionObserver(async entries => {
      if (!entries.some(entry => entry.isIntersecting) || inFlight) return;
      inFlight = true;
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: String(nextPage) });
        if (kind && term) { params.set('kind', kind); params.set('term', term); }
        const response = await fetch(`/api/albums?${params}`, { cache: 'no-store', signal: controller.signal });
        if (!response.ok) throw new Error('Unable to load more albums');
        const data: { albums: Album[] } = await response.json();
        if (controller.signal.aborted) return;
        if (!data.albums.length) throw new Error('No albums on next page');
        setAlbums(previous => {
          const known = new Set(previous.map(album => album.id));
          return [...previous, ...data.albums.filter(album => !known.has(album.id))];
        });
        setNextPage(value => value + 1);
      } catch { if (!controller.signal.aborted) setFailed(true); }
      finally { inFlight = false; if (!controller.signal.aborted) setLoading(false); }
    }, { rootMargin: '300px' });
    observer.observe(element);
    return () => { observer.disconnect(); controller.abort(); };
  }, [total, nextPage, kind, term, failed, observerSupported]);

  const hasMore = nextPage <= Math.ceil(total / PAGE_SIZE);
  const fallbackHref = `${fallbackBase}${fallbackBase.includes('?') ? '&' : '?'}page=${nextPage}`;
  return <section className="gallery-section" aria-labelledby="gallery-title">
    <div className="gallery-heading"><div><p className="eyebrow">lumolog collection</p><h1 id="gallery-title">{title}</h1>{intro && <p>{intro}</p>}</div><span className="gallery-count">{total} 组作品</span></div>
    {albums.length ? <div className="gallery-grid">{albums.map((album, index) => <GalleryCard key={album.id} album={album} index={index} onOpen={source => { openedFrom.current = source; setSelection({ albumIndex: index, photoIndex: 0 }); }} />)}</div> : <p className="empty-state">这里还没有作品。</p>}
    {hasMore && <div className="gallery-load-more" ref={sentinel}>
      {loading && <span className="gallery-load-status" role="status">正在加载更多作品…</span>}
      {(failed || !observerSupported) && <a className="gallery-load-fallback" href={fallbackHref}>{failed ? '加载失败，点击继续浏览' : '继续浏览更多作品'}</a>}
      <noscript><a className="gallery-load-fallback" href={fallbackHref}>继续浏览更多作品</a></noscript>
    </div>}
    <Lightbox albums={albums} selection={selection} source={openedFrom} onMove={move} onSelect={photoIndex => setSelection(current => current ? { ...current, photoIndex } : null)} onClose={() => setSelection(null)} />
  </section>;
}
