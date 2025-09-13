/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // enables static HTML export
  reactStrictMode: true,
  images: {
    unoptimized: true, // disable Image Optimization API for static export
  },
};

module.exports = nextConfig;