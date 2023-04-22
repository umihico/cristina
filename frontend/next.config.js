/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.cloudfront.net",
        port: "",
        pathname: "/images/**",
      },
      {
        protocol: "https",
        hostname: `source.unsplash.com`,
        port: "",
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;
