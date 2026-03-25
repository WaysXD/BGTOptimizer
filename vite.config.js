import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // @wagmi/connectors imports porto/internal even when Porto connector is unused.
      // Stub it with an empty module so the Vite build succeeds.
      "porto/internal": path.resolve(__dirname, "./src/porto-stub.js"),
    },
  },
});
