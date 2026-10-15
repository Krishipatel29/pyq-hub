import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    // in development, send /api calls to the Express server
    proxy: {
      "/api": "http://localhost:5000",
      "/uploads": "http://localhost:5000",
    },
  },
});
