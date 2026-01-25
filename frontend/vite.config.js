import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");

  return {
    plugins: [react()],

    server:
      mode === "development"
        ? {
            proxy: {
              "/api": {
                target: env.VITE_BACKEND_LINK,
                changeOrigin: true,
              },
            },
          }
        : undefined,
  };
});
