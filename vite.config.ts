import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_NEXTSTEP_URL': JSON.stringify(process.env.VITE_NEXTSTEP_URL || 'http://localhost:8084'),
  },
})
