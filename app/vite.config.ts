/// <reference types="vitest/config" />
import path from 'node:path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// base './' + HashRouter: the built site works from any folder on any static host.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': path.resolve(import.meta.dirname, './src') } },
  test: { environment: 'jsdom', globals: true, include: ['src/**/*.test.ts', 'src/**/*.test.tsx'] },
})
