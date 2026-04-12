import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '', [])
  
  return {
    plugins: [react()],
    define: {
      'import.meta.env.VITE_NEXTSTEP_URL': JSON.stringify(env.VITE_NEXTSTEP_URL || 'http://localhost:8084'),
      'import.meta.env.VITE_NEXTSTEP_API_SECRET_KEY': JSON.stringify(env.VITE_NEXTSTEP_API_SECRET_KEY || ''),
    },
  }
})
