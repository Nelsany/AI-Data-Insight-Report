import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * 开发环境下通过非 localhost 域名/网卡地址访问时，Next 会默认阻止加载 dev 资源（HMR 等）。
   * 这里放开本机与 VM 网卡地址，避免“无法访问/资源被拦截”的问题。
   */
  allowedDevOrigins: ["localhost", "127.0.0.1", "192.168.64.215"],
  async rewrites() {
    // 独立后端联调：将前端的 /api/* 反代到后端
    // 通过环境变量 BACKEND_URL 覆盖（默认 http://localhost:4000）
    const backend = process.env.BACKEND_URL || "http://localhost:4000";
    return [
      {
        source: "/api/:path*",
        destination: `${backend}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
