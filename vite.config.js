import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    allowedHosts: [
      // Allow ngrok tunnels
      'ngrok-free.app',
      'ngrok-free.dev',
      // Specific subdomain shown in your terminal (add more if it changes)
      'unposing-madelaine-melanospermous.ngrok-free.dev',
    ],
  },
})
