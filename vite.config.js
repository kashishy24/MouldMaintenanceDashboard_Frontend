import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const backendBase = (env.VITE_BACKEND_BASE_URL || "").replace(/\/+$/, "");
  // If VITE_BACKEND_BASE_URL ends with /api, proxy target should be the host root.
  const proxyTarget = backendBase ? backendBase.replace(/\/api$/i, "") : "http://localhost:3004";

  return {
    define: {
      "process.env": process.env,
    },
    plugins: [react()],
    server: {
      proxy: {
        "/api": {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    build: {
      commonjsOptions: {
        transformMixedEsModules: true,
      },
    },
  };
});
