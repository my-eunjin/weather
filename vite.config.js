import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  base:'',  // GitHub 레포지토리 이름에 맞게 설정
  publicPath:'/weather/',
  build:{
    outDir:'dist',  // 빌드 출력 폴더 설정 (기본적으로 'dist')
    rollupOptions: {
      input: 'index.html',  // index.html이 빌드에 포함되도록 설정
    },
  }
})
