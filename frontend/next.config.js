/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: `${
          process.env.BUCKET_NAME || "cristina-umihico-ImageBucket"
        }.s3.amazonaws.com`,
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
