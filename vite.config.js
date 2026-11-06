import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // <-- 1. Importáld be

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // <-- 2. Add hozzá a plugins tömbhöz
  ],
})