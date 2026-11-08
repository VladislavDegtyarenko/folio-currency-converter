import preact from "@preact/preset-vite";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [preact()],
  base: "./",
  resolve: {
    alias: {
      // Preact already provides the subscription hook used by Ariakit.
      "use-sync-external-store/shim": "preact/compat",
    },
  },
  test: {
    server: {
      deps: {
        // Apply the same Preact aliases inside React-based dependencies in tests.
        inline: [
          "@ariakit/react",
          "@ariakit/react-components",
          "@ariakit/react-utils",
          "@ariakit/react-store",
          "framer-motion",
        ],
      },
    },
  },
  build: {
    minify: "terser",
    terserOptions: {
      compress: { passes: 2 },
    },
  },
});
