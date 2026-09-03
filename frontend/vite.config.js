import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Bind on all interfaces (IPv4 included) so http://localhost:5173 and
    // http://127.0.0.1:5173 both work — avoids the Windows IPv6-only "localhost
    // isn't working" issue where Vite would otherwise bind to ::1 only.
    host: true,
    port: 5173,
    strictPort: false,
  },
})
