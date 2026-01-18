/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['Video'],
  webpack: (config) => {
    // Allow importing from parent directory (source files)
    config.resolve.symlinks = false;
    return config;
  },
  experimental: {
    externalDir: true,
  },
};

export default nextConfig;
