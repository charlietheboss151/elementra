import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  // Apex domain (charlietheboss.com). Logo and other files are bundled into
  // /assets so they still load; do not hard-code /logo.jpg.
  base: "/",
  plugins: [react()],
})
