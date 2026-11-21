/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Disable webpack disk caching to avoid Windows OneDrive snapshot file locks
    config.cache = false;
    return config;
  },
  eslint: {
    ignoreDuringBuilds: true,
  }
};

export default nextConfig;
