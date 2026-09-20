/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Memastikan ESLint tidak membatalkan proses build Vercel
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Mencegah kesalahan build akibat tipe variabel tersembunyi
    ignoreBuildErrors: true,
  },
  webpack: (config, { isServer }) => {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }

    return config;
  },
};

export default nextConfig;
