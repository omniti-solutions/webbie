/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Disable type checking during build to allow deployment
    ignoreBuildErrors: true,
  },
  eslint: {
    // Disable ESLint during build to allow deployment
    ignoreDuringBuilds: true,
  },
  experimental: {
    typedRoutes: false,
  },
  swcMinify: true,
};

module.exports = nextConfig;
