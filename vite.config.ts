import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  // Relative URLs so the logo, icon, and scripts load on GitHub Pages,
  // itch.io, and other hosts that are not the domain root.
  base: "./",
  plugins: [react()],
})
