// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import preact from "@astrojs/preact";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  // Placeholder until the main domain is attached at launch (build plan, step 12).
  site: "https://jbur-site.workers.dev",
  output: "static",
  integrations: [mdx(), sitemap(), preact()],
});
