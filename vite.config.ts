import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import path from "path";

// Ren, eksplicit Vite-config:
// - Port 8080
// - Dev proxy: '/er' -> Event Registry, '/api' -> Vercel dev (localhost:3000)
// - React SWC plugin
export default defineConfig({
  css: { postcss: { plugins: [tailwindcss(), autoprefixer()] } },
  server: {
    host: "::",
    port: 8080,
    strictPort: true,
    open: false,
    proxy: {
      "/er": {
        target: "https://eventregistry.org",
        changeOrigin: true,
        secure: true,
        rewrite: (p) => p.replace(/^\/er/, ""),
      },
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      }
    },
  },
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});

