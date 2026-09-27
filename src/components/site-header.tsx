'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { termUrl } from '@/lib/gallery-view';

export function SiteHeader({ categories }: { categories: string[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [fullscreenSupported, setFullscreenSupported] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    // Browser capability is unavailable during server render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFullscreenSupported(Boolean(document.fullscreenEnabled && document.documentElement.requestFullscreen));
    const update = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', update);
    return () => document.removeEventListener('fullscreenchange', update);
  }, []);

  useEffect(() => {
    if (!open) return;
    const closeOnOutside = (event: MouseEvent) => {
      if (!(event.target as Element).closest('.nav-dropdown')) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); };
    document.addEventListener('click', closeOnOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => { document.removeEventListener('click', closeOnOutside); document.removeEventListener('keydown', closeOnEscape); };
  }, [open]);

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch { /* Unsupported in some embedded previews. */ }
  }

  const isCurrent = (href: string) => pathname.replace(/\/$/, '') === href.replace(/\/$/, '');
  const inCategories = pathname.startsWith('/categories');

  return <header className="site-bar">
    <div className="brand">
      <Link className="brand-logo" href="/" aria-label="lumolog 首页"><img src="/images/lumolog-mark.svg" alt="" width="36" height="36" /></Link>
      <span className="brand-copy"><span className="brand-heading"><Link className="brand-title" href="/"><strong>lumolog</strong></Link><small className="brand-tagline">将光留在时间里</small></span><small className="brand-copyright">© 2025 - {new Date().getFullYear()} By lumolog</small></span>
    </div>
    <nav className="site-nav" aria-label="主导航">
      <div className="nav-dropdown" onMouseEnter={() => { if (matchMedia('(hover: hover)').matches) setOpen(true); }} onMouseLeave={() => { if (matchMedia('(hover: hover)').matches) setOpen(false); }} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
        <button className="nav-dropdown-trigger" type="button" aria-expanded={open} aria-controls="category-menu" data-active={inCategories || pathname.startsWith('/tags') ? true : undefined} onClick={() => setOpen(value => matchMedia('(hover: hover) and (pointer: fine)').matches ? true : !value)}>分类</button>
        {open && <div className="nav-menu" id="category-menu"><div className="nav-menu-inner">
          <Link href="/" aria-current={isCurrent('/') || isCurrent('/photos/') ? 'page' : undefined} onClick={() => setOpen(false)}>全部作品</Link>
          <Link href="/categories/" aria-current={isCurrent('/categories/') ? 'page' : undefined} onClick={() => setOpen(false)}>分类总览</Link>
          {categories.map(name => <Link key={name} href={termUrl('categories', name)} aria-current={isCurrent(termUrl('categories', name)) ? 'page' : undefined} onClick={() => setOpen(false)}>{name}</Link>)}
          <Link href="/tags/" aria-current={isCurrent('/tags/') ? 'page' : undefined} onClick={() => setOpen(false)}>标签</Link>
        </div></div>}
      </div>
      {fullscreenSupported && <button className="nav-fullscreen" type="button" aria-label={fullscreen ? '退出全屏' : '切换全屏'} title={fullscreen ? '退出全屏' : '切换全屏'} onClick={toggleFullscreen}><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M9 4H4v5m11-5h5v5M4 15v5h5m11-5v5h-5" /></svg></button>}
    </nav>
  </header>;
}
