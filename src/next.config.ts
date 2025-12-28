import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */

  // Correct location for your version (Next.js 15+)
  serverExternalPackages: ['firebase-admin'],

  // REMOVED: experimental: { ... } 
  // You don't need the experimental block anymore.

  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
