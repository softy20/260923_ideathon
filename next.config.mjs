/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "kopis.or.kr",
        pathname: "/upload/**",
      },
    ],
  },
};

export default nextConfig;
