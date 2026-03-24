
import { defineConfig } from 'vite';
export default defineConfig({
  base: '/', // Replace with your repo name
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
  // ...other config
});