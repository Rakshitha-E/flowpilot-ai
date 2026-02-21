import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on mode
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:8000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
    // Define global variables for the app
    define: {
      // This makes the API URL available globally as import.meta.env.VITE_API_URL
      'import.meta.env.VITE_API_URL': JSON.stringify(env.VITE_API_BASE_URL || ''),
    },
  }
})
