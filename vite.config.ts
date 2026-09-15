/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'node:path';
import { readFileSync } from 'node:fs';

// Injects site title/description from content/site.json into the static HTML
// so search engines see them without running JavaScript.
function seoHtmlPlugin() {
  return {
    name: 'fireflyfarm-seo-html',
    transformIndexHtml(html: string) {
      const site = JSON.parse(readFileSync(resolve(import.meta.dirname, 'content/site.json'), 'utf8'));
      return html
        .replaceAll('%SEO_TITLE%', escapeHtml(site.seo.title))
        .replaceAll('%SEO_DESCRIPTION%', escapeHtml(site.seo.description));
    },
  };
}

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export default defineConfig({
  base: '/fireflyfarm/',
  plugins: [react(), tailwindcss(), seoHtmlPlugin()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        admin: resolve(import.meta.dirname, 'admin/index.html'),
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],
  },
});
