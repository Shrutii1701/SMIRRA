import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Proxy API calls to our Express backend during development.
    // This avoids CORS issues — the browser thinks the API is on :5173,
    // but Vite forwards requests to :5000 behind the scenes.
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
