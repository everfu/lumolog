'use client';

import { useEffect, useRef, useState } from 'react';
import type { Album } from '@/lib/gallery-schema';
import { displayFacts, type CameraFacts } from '@/lib/photo-facts';

export type Selection = { albumIndex: number; photoIndex: number } | null;
function Fact({ children, text }: { children: React.ReactNode; text: string }) {
  return text ? <span className="lightbox-fact">{children}<span>{text}</span></span> : null;
}

export function Lightbox({ albums, selection, onMove, onSelect, onClose }: {
  albums: Album[]; selection: Selection; onMove: (delta: number) => void;
  onSelect: (index: number) => void; onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const touchStart = useRef(0);
  const [shownSrc, setShownSrc] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadMessage, setLoadMessage] = useState('正在加载照片…');
  const [extracted, setExtracted] = useState<CameraFacts>({});
  const album = selection ? albums[selection.albumIndex] : undefined;
  const photo = album && selection ? album.photos[selection.photoIndex] : undefined;

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (selection && !element.open) element.showModal();
    else if (!selection && element.open) element.close();
  }, [selection]);

  useEffect(() => {
    if (!photo || !album) return;
    let cancelled = false;
    const controller = new AbortController();
    const timer = setTimeout(() => setLoading(true), shownSrc ? 180 : 0);
    const image = new Image();
    image.onload = () => {
      if (cancelled) return;
      clearTimeout(timer);
      setShownSrc(image.src);
      setLoading(false);
    };
    image.onerror = () => {
      if (cancelled) return;
      if (!image.src.endsWith('/images/photo-fallback.svg')) image.src = '/images/photo-fallback.svg';
      else { clearTimeout(timer); setLoadMessage('照片暂时无法加载'); setLoading(true); }
    };
    image.src = photo.src;
    // Reset facts for the newly selected remote image.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setExtracted({});
    setLoadMessage('正在加载照片…');
    fetch(`/api/metadata/${encodeURIComponent(album.id)}/${encodeURIComponent(photo.id)}`, { cache: 'no-store', signal: controller.signal })
      .then(response => response.ok ? response.json() : null)
      .then(data => { if (!cancelled && data?.facts) setExtracted(data.facts); })
      .catch(() => {});
    return () => { cancelled = true; clearTimeout(timer); controller.abort(); };
    // The requested image is the effect dependency; shownSrc intentionally remains the previous photo while loading.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [album?.id, photo?.id, photo?.src]);

  useEffect(() => {
    if (!selection) return;
    const handleKeys = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault(); onMove(event.key === 'ArrowRight' ? 1 : -1);
      }
    };
    document.addEventListener('keydown', handleKeys);
    return () => document.removeEventListener('keydown', handleKeys);
  }, [selection, onMove]);

  const facts = photo ? displayFacts(photo, extracted) : null;
  const lat = photo?.lat;
  const lon = photo?.lon;
  const hasMap = lat !== undefined && lon !== undefined;

  return <dialog ref={dialog} className="lightbox" aria-label={album && selection ? `${album.title}，第 ${selection.photoIndex + 1} 张照片` : '照片浏览器'} onClose={onClose} onClick={event => { if (event.target === dialog.current) onClose(); }} onTouchStart={event => { touchStart.current = event.changedTouches[0].screenX; }} onTouchEnd={event => { const distance = event.changedTouches[0].screenX - touchStart.current; if (Math.abs(distance) > 55) onMove(distance < 0 ? 1 : -1); }}>
    <div className="lightbox-shell">
      <button className="lightbox-close icon-button" type="button" aria-label="关闭照片" onClick={onClose}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5l14 14M19 5 5 19" /></svg></button>
      <button className="lightbox-prev icon-button" type="button" aria-label="上一张" onClick={() => onMove(-1)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14.5 5-7 7 7 7" /></svg></button>
      <div className={`lightbox-media${shownSrc ? ' has-photo' : ''}`}><img src={shownSrc || undefined} alt={photo?.alt ?? ''} />{loading && <span className="lightbox-loading" role="status">{loadMessage}</span>}</div>
      <button className="lightbox-next icon-button" type="button" aria-label="下一张" onClick={() => onMove(1)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9.5 5 7 7-7 7" /></svg></button>
      {album && photo && facts && <div className="lightbox-caption">
        <h2>{album.title}</h2>
        {(photo.caption || album.description) && <p className="lightbox-description">{photo.caption || album.description}</p>}
        <div className="lightbox-facts">
          <Fact text={[facts.camera, facts.lens].filter(Boolean).join(' · ')}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h3l2-2h6l2 2h3v12H4z" /><circle cx="12" cy="13" r="3.5" /></svg></Fact>
          <Fact text={[facts.focal, facts.aperture && `f/${facts.aperture}`, facts.shutter && `${facts.shutter}s`, facts.iso && `ISO ${facts.iso}`].filter(Boolean).join(' · ')}><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="2" /><path d="M12 3v7M20 8l-6 3M18 19l-5-5M6 19l5-5M4 8l6 3" /></svg></Fact>
          <Fact text={photo.location || album.location || ''}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0z" /><circle cx="12" cy="10" r="2.5" /></svg></Fact>
          <Fact text={facts.taken || album.date}><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 3v4M17 3v4M3 10h18" /></svg></Fact>
        </div>
        {photo.credit && <p className="lightbox-credit">图片来源：{photo.credit.url ? <a href={photo.credit.url} target="_blank" rel="noopener noreferrer">{photo.credit.name} ↗</a> : photo.credit.name}{photo.credit.license && ` · ${photo.credit.license}`}</p>}
        {hasMap && <a className="lightbox-map" href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=12/${lat}/${lon}`} target="_blank" rel="noopener noreferrer">在地图中查看位置 ↗</a>}
      </div>}
      {album && album.photos.length > 1 && <div className="lightbox-dots" aria-label="组内照片">{album.photos.map((item, index) => <button key={item.id} type="button" className={selection?.photoIndex === index ? 'active' : ''} aria-label={`查看第 ${index + 1} 张`} aria-current={selection?.photoIndex === index} onClick={() => onSelect(index)} />)}</div>}
    </div>
  </dialog>;
}
