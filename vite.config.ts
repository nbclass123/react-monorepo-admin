import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import { createSvgIconsPlugin } from "vite-plugin-svg-icons";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  return {
    base: "/",
    plugins: [
      react(),
      createSvgIconsPlugin({
        iconDirs: [path.resolve(process.cwd(), "src/assets/svg")],
        symbolId: "icon-[name]",
        inject: "body-last",
        customDomId: "__svg__icons__dom__"
      })
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src")
      }
    },
    build: {
      outDir: "dist",
      minify: "oxc", // 启用 oxc 压缩
      sourcemap: mode === "development",
      chunkSizeWarningLimit: 1500,
      rolldownOptions: {
        checks: {
          pluginTimings: false
        },
        output: {
          codeSplitting: {
            groups: [
              // 1. 基础框架包（变动极少，适合单独拆出）
              {
                name: "react-vendor",
                test: /\/node_modules\/(react|react-dom|react-router-dom)\//,
                priority: 20 // 优先级较高，会优先匹配
              },
              // 2. UI库单独打包（如 antd）
              {
                name: "antd-vendor",
                test: /\/node_modules\/antd\//,
                priority: 20
              },
              // 3. 其他所有 node_modules 依赖
              {
                name: "vendor",
                test: /\/node_modules\//,
                priority: 10
              },
              // 4. 按入口分块（高级功能，按需开启）
              {
                name: "shared",
                test: /\/src\/(components|utils)\//,
                entriesAware: true,
                entriesAwareMergeThreshold: 30000 // 小于30KB的碎片块会合并
              }
            ]
          }
        }
      }
    }
  };
});
