import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";

export default defineConfig({
  site: "https://johnguerra.co",
  base: "/blog",
  outDir: "../blog",
  cacheDir: "./.astro-cache",
  integrations: [mdx()],
  build: {
    assets: "_astro",
  },
});
