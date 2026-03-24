
import { defineConfig } from 'vite';
export default defineConfig({
  base: '/', 
  server: {
    proxy: {
      '/api': 'https://dream-fit-bds1.onrender.com',
    },
  },
});