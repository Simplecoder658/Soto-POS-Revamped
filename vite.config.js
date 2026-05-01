import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Ensures assets are loaded relative to the deployment root
  base: './', 
  build: {
    outDir: 'dist',
  }
})
