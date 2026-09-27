import type { NextConfig } from 'next';
import { remoteImageOrigins } from './src/lib/image-origins';

const config: NextConfig = {
  reactStrictMode: true,
  trailingSlash: true,
  images: {
    remotePatterns: remoteImageOrigins().map(origin => ({
      protocol: 'https',
      hostname: new URL(origin).hostname,
      port: new URL(origin).port,
      pathname: '/**',
    })),
    qualities: [75],
  },
};

export default config;
