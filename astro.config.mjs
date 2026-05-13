// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  site: 'https://functoreality.github.io',
  base: '/research-notes',
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
