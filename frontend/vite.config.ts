import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Configures the Vite development server and React transform.
export default defineConfig({
  plugins: [react()],
})
