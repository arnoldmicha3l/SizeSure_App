
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');

  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      port: 5175,
      strictPort: true,

      allowedHosts: [
        'brother-mesa-manufacturing-teeth.trycloudflare.com'
      ],

      proxy: {
        '/api': {
          target: env.VITE_BACKEND_ORIGIN || 'http://localhost:8081',
          changeOrigin: true
        }
      }
    }
  };
});
