import type { NextConfig } from "next";
import path from "path";

const rootDir = path.join(__dirname, "..");

const nextConfig: NextConfig = {
  // 设置输出文件追踪根目录（monorepo 需要）
  // 指向项目根目录，确保包含所有必要的文件
  outputFileTracingRoot: rootDir,
  // Turbopack 根目录（与 outputFileTracingRoot 保持一致，避免警告）
  turbopack: {
    root: rootDir,
  },
  // 优化开发体验
  experimental: {
    // 启用更快的编译
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-accordion',
      '@radix-ui/react-alert-dialog',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-popover',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
      '@radix-ui/react-tooltip',
    ],
  },
  // 类型检查配置
  typescript: {
    // 生产构建时进行类型检查，开发时跳过以加快速度
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
