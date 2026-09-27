'use client';

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import Image from 'next/image';
import type { Album, Photo } from '@/lib/gallery-schema';
import type { GallerySelection } from '@/lib/gallery-navigation';

const FALLBACK_IMAGE = '/images/photo-fallback.svg';

function LightboxPhoto({ photo }: { photo: Photo }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const src = failed ? FALLBACK_IMAGE : photo.src;
  return <>
    {photo.thumb && photo.thumb !== photo.src && <Image className="lightbox-thumb" src={photo.thumb} alt="" aria-hidden="true" fill sizes="64px" loading="eager" decoding="async" />}
    <Image key={src} className={`lightbox-full${loaded ? ' is-loaded' : ''}`} src={src} alt={photo.alt} fill sizes="(max-width: 620px) calc(100vw - 20px), (max-width: 1900px) 70vw, 1320px" loading="eager" decoding="async" draggable={false} unoptimized={failed} onLoad={() => setLoaded(true)} onError={() => { if (!failed) { setLoaded(false); setFailed(true); } else setLoaded(true); }} />
  </>;
}

export function Lightbox({ albums, selection, source, onMove, onSelect, onClose }: {
  albums: Album[];
  selection: GallerySelection;
  source: RefObject<HTMLButtonElement | null>;
  onMove: (delta: -1 | 1) => void;
  onSelect: (index: number) => void;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const shell = useRef<HTMLDivElement>(null);
  const closing = useRef(false);
  const swipeStart = useRef<{ pointerId: number; x: number; y: number } | null>(null);
  const album = selection ? albums[selection.albumIndex] : undefined;
  const photo = album && selection ? album.photos[selection.photoIndex] : undefined;
  const photoKey = album && photo ? `${album.id}/${photo.id}` : '';
  const isOpen = selection !== null;

  const animateShell = useCallback((reverse: boolean): Promise<Animation | null> => {
    const element = shell.current;
    if (!element || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return Promise.resolve(null);
    const target = element.getBoundingClientRect();
    const origin = source.current?.getBoundingClientRect();
    const visible = origin && origin.width > 0 && origin.height > 0 && origin.bottom > 0 && origin.top < innerHeight && origin.right > 0 && origin.left < innerWidth;
    const from = visible ? {
      transform: `translate(${origin.x + origin.width / 2 - target.x - target.width / 2}px, ${origin.y + origin.height / 2 - target.y - target.height / 2}px) scale(${origin.width / target.width}, ${origin.height / target.height})`,
      opacity: 0.9,
    } : { transform: 'scale(.96)', opacity: 0 };
    const to = { transform: 'translate(0, 0) scale(1)', opacity: 1 };
    element.classList.add('is-animating');
    const animation = element.animate(reverse ? [to, { ...from, opacity: 0 }] : [from, to], {
      duration: reverse ? 280 : 400,
      easing: reverse ? 'cubic-bezier(.4, 0, 1, 1)' : 'cubic-bezier(.2, .8, .2, 1)',
      fill: reverse ? 'forwards' : 'none',
    });
    return animation.finished.then(() => animation).catch(() => null);
  }, [source]);

  const requestClose = useCallback(() => {
    if (closing.current || !dialog.current?.open) return;
    closing.current = true;
    dialog.current.classList.add('is-closing');
    void animateShell(true).then(animation => {
      dialog.current?.close();
      animation?.cancel();
      shell.current?.classList.remove('is-animating');
      source.current?.focus({ preventScroll: true });
      onClose();
    });
  }, [animateShell, onClose, source]);

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (isOpen && !element.open) {
      closing.current = false;
      element.classList.remove('is-closing');
      element.showModal();
      element.focus({ preventScroll: true });
      element.classList.add('is-opening');
      void animateShell(false).then(() => {
        element.classList.remove('is-opening');
        if (!closing.current) shell.current?.classList.remove('is-animating');
      });
    } else if (!isOpen && element.open) {
      element.close();
      source.current?.focus({ preventScroll: true });
    }
  }, [isOpen, animateShell, source]);

  useEffect(() => {
    if (!isOpen) return;
    document.body.classList.add('lightbox-open');
    return () => document.body.classList.remove('lightbox-open');
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeys = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        onMove(event.key === 'ArrowRight' ? 1 : -1);
      }
    };
    document.addEventListener('keydown', handleKeys);
    return () => document.removeEventListener('keydown', handleKeys);
  }, [isOpen, onMove]);

  const location = photo?.location || album?.location;
  const date = photo?.taken || album?.date;
  const description = photo?.caption || album?.description;

  return <dialog ref={dialog} className="lightbox" tabIndex={-1} aria-label={album && selection ? `${album.title}，第 ${selection.photoIndex + 1} 张照片` : '照片预览'} onClose={() => { if (selection && !closing.current) { source.current?.focus({ preventScroll: true }); onClose(); } }} onCancel={event => { event.preventDefault(); requestClose(); }} onClick={event => { if (event.target === dialog.current) requestClose(); }}>
    <div ref={shell} className="lightbox-shell">
      <div className="lightbox-media" onPointerDown={event => {
        if (event.button !== 0 || (event.target instanceof Element && event.target.closest('button, a'))) return;
        swipeStart.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
        event.currentTarget.setPointerCapture(event.pointerId);
      }} onPointerUp={event => {
        const start = swipeStart.current;
        if (!start || start.pointerId !== event.pointerId) return;
        swipeStart.current = null;
        const dx = event.clientX - start.x;
        const dy = event.clientY - start.y;
        if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.2) onMove(dx < 0 ? 1 : -1);
      }} onPointerCancel={() => { swipeStart.current = null; }}>
        {photo && <LightboxPhoto key={photoKey} photo={photo} />}
        <button className="lightbox-control lightbox-close" type="button" aria-label="关闭照片预览" onClick={requestClose}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5l14 14M19 5 5 19" /></svg></button>
        <button className="lightbox-control lightbox-prev" type="button" aria-label="上一张照片" onClick={() => onMove(-1)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14.5 5-7 7 7 7" /></svg></button>
        <button className="lightbox-control lightbox-next" type="button" aria-label="下一张照片" onClick={() => onMove(1)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9.5 5 7 7-7 7" /></svg></button>
        {album && album.photos.length > 1 && <div className="lightbox-dots" aria-label="组内照片">{album.photos.map((item, index) => <button key={item.id} type="button" className={selection?.photoIndex === index ? 'active' : ''} aria-label={`查看第 ${index + 1} 张照片`} aria-current={selection?.photoIndex === index ? 'true' : undefined} onClick={() => onSelect(index)} />)}</div>}
      </div>
      {album && photo && <div className="lightbox-caption">
        <h2>{album.title}</h2>
        {description && <p className="lightbox-description">{description}</p>}
        {(location || date) && <div className="lightbox-facts">
          {location && <span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0z" /><circle cx="12" cy="10" r="2.5" /></svg>{location}</span>}
          {date && <span><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 3v4M17 3v4M3 10h18" /></svg>{date}</span>}
        </div>}
        {photo.credit && <p className="lightbox-credit">图片来源：{photo.credit.url ? <a href={photo.credit.url} target="_blank" rel="noopener noreferrer">{photo.credit.name} ↗</a> : photo.credit.name}{photo.credit.license && ` · ${photo.credit.license}`}</p>}
      </div>}
    </div>
  </dialog>;
}
