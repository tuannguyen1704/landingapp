/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  poweredByHeader: false,
  compress: true,
  images: { remotePatterns: [{ protocol: "https", hostname: "**" }] },
};

export default nextConfig;
