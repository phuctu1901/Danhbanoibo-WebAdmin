import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/Danhbanoibo-WebAdmin/', // Cấu hình bắt buộc để chạy trên Github Pages
})
