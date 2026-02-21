import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://mysite.com",
  devToolbar: {
    enabled: false,
  },
  integrations: [sitemap(), react()],
  prefetch: true,
  vite: {
    ssr: {
      noExternal: ["smartypants"],
    },

    plugins: [tailwindcss()],
  },
});
