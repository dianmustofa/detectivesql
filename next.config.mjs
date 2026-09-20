/** @type {import('next').NextConfig} */
const nextConfig = {
  // Abaikan error ESLint saat build di Vercel
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Abaikan error TypeScript saat build di Vercel
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
