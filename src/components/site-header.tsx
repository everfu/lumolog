'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { termUrl } from '@/lib/gallery-view';

export function SiteHeader({ categories }: { categories: string[] }) {
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

  return <header className="site-bar">
    <div className="brand">
      <Link className="brand-logo" href="/" aria-label="lumolog 首页"><img src="/images/lumolog-mark.svg" alt="" width="36" height="36" /></Link>
      <span className="brand-copy"><span className="brand-heading"><Link className="brand-title" href="/"><strong>lumolog</strong></Link><small className="brand-tagline">将光留在时间里</small></span><small className="brand-copyright">© 2025 - {new Date().getFullYear()} By lumolog</small></span>
    </div>
    <nav className="site-nav" aria-label="主导航">
      <div className="nav-dropdown" onMouseEnter={() => { if (matchMedia('(hover: hover)').matches) setOpen(true); }} onMouseLeave={() => { if (matchMedia('(hover: hover)').matches) setOpen(false); }}>
        <button className="nav-dropdown-trigger" type="button" aria-expanded={open} aria-controls="category-menu" onClick={() => setOpen(value => matchMedia('(hover: hover)').matches ? true : !value)}>分类</button>
        {open && <div className="nav-menu" id="category-menu"><div className="nav-menu-inner">
          {categories.map(name => <Link key={name} href={termUrl('categories', name)} onClick={() => setOpen(false)}>{name}</Link>)}
          <Link href="/" onClick={() => setOpen(false)}>全部</Link><Link href="/tags/" onClick={() => setOpen(false)}>标签</Link>
        </div></div>}
      </div>
      {fullscreenSupported && <button className="nav-fullscreen" type="button" aria-label={fullscreen ? '退出全屏' : '切换全屏'} title={fullscreen ? '退出全屏' : '切换全屏'} onClick={toggleFullscreen}><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M9 4H4v5m11-5h5v5M4 15v5h5m11-5v5h-5" /></svg></button>}
    </nav>
  </header>;
}
