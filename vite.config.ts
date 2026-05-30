import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { reactTracer } from "live-studio/vite";

export default defineConfig({
  base: "/",
  plugins: [react(), reactTracer()],
  server: {
    allowedHosts: [".lhr.life"],
  },
  preview: {
    allowedHosts: [".lhr.life"],
  },
});
