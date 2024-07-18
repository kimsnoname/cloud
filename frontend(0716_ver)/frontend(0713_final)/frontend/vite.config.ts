import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
   server: {
     host: true, // 모든 네트워크 인터페이스에서 접근 가능하게 설정
     port: 5173
   },
  plugins: [react()],
})
