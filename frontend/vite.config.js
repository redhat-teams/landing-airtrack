import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// En développement, Vite (port 5173) relaie l'API vers Django :
//   python manage.py runserver 0.0.0.0:8000   (dossier backend/)
//   npm run dev                                (dossier frontend/)
const DJANGO = process.env.DJANGO_URL || 'http://127.0.0.1:8001';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // accessible depuis le téléphone sur le même Wi-Fi
    port: 5173,
    proxy: {
      '/api': { target: DJANGO, changeOrigin: true },
      '/download': { target: DJANGO, changeOrigin: true },
      '/admin': { target: DJANGO, changeOrigin: true },
      '/static': { target: DJANGO, changeOrigin: true },
    },
  },
  build: { outDir: 'dist', assetsDir: 'assets', sourcemap: false },
});
