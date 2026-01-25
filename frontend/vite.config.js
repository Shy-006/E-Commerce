import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
	plugins: [react()],

	
	envDir: path.resolve(__dirname, ".."),

	server: {
		proxy: {
			"/api": {
				target: process.env.VITE_BACKEND_LINK,
				changeOrigin: true,
			},
		},
	},
});
