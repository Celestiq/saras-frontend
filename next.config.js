/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // If you use external images from other hosts, list them here:
  images: {
    // domains: ['example.com', 'cdn.somestore.com'],
    // loader: 'default'
  },
  experimental: {
    // only if you need specific experimental flags, otherwise omit
  },
};

module.exports = nextConfig;