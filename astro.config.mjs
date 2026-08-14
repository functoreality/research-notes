// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import path from 'path';
import { loadSiteConfig } from './scripts/site-config.mjs';

const siteConfig = loadSiteConfig();
const publicDir = path.resolve(process.env.NOTES_PUBLIC_DIR || './public');

// https://astro.build/config
export default defineConfig({
  site: siteConfig.site,
  base: siteConfig.base,
  publicDir,
  integrations: [
    react({
      experimentalReactChildren: true,
    }),
    tailwind()
  ],
  build: {
    inlineStylesheets: 'auto'
  },
  vite: {
    ssr: {
      noExternal: ['katex']
    }
  }
});
