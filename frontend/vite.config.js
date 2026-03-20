import {defineConfig} from 'vite';
import svgr from "vite-plugin-svgr"

const proxyTarget = process.env.VITE_API_PROXY_TARGET || 'http://localhost:3000';

export default defineConfig({
    plugins:[svgr()],
    server: {
        proxy: {
            '/api': {
                target: proxyTarget,
                changeOrigin: true
            }
        }
    }
})