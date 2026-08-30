import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  // Apex domain (charlietheboss.com). Logo and other files are bundled into
  // /assets so they still load; do not hard-code /logo.jpg.
  base: "/",
  plugins: [react()],
  server: {
    // Bind IPv4. Default "localhost" was IPv6-only (::1), so 127.0.0.1:5173
    // refused and extra Vite copies jumped to 5174.
    host: "127.0.0.1",
    port: 5173,
    strictPort: true,
  },
})
