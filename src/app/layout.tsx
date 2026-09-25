import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || 'http://localhost:3000'),
  title: { default: 'lumolog', template: '%s · lumolog' },
  description: '以照片记录路途、城市与自然。',
  openGraph: {
    title: 'lumolog',
    description: '以照片记录路途、城市与自然。',
    images: [{ url: '/images/opengraph.jpg', alt: 'lumolog：蓝色时刻的海岸与灯塔' }],
  },
  icons: { icon: '/images/lumolog-mark.svg' },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body data-photo-fallback="/images/photo-fallback.svg">
    <a className="skip-link" href="#main-content">跳到内容</a>
    {children}
  </body></html>;
}
