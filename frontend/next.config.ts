import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/:path*`, // Proxy to FastAPI
      },
      {
        source: "/output/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/output/:path*`, // Static output from FastAPI
      }
    ];
  },
};

export default nextConfig;
