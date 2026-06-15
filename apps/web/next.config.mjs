/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@bidconnect/ui",
    "@bidconnect/utils",
    "@bidconnect/types",
    "@bidconnect/db",
    "@bidconnect/email-templates",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.neon.tech",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.vercel-storage.com",
        pathname: "/**",
      },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "prisma"],
  },
};

export default nextConfig;