import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// fileURLToPath : gere correctement la lettre de lecteur et les espaces du
// chemin sous Windows, contrairement a URL.pathname.
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: {
    port: 5173,
    // Echoue bruyamment si 5173 est occupe, plutot que de glisser en silence
    // sur 5174 : un port different change l'en-tete Origin envoye par le
    // navigateur et provoquait un 403 "Invalid CORS request" difficile a lire.
    strictPort: true,

    // Proxy vers l'API Spring Boot : le front appelle /api en relatif, ce qui
    // evite toute URL absolue dans le code et tout probleme de CORS en dev.
    proxy: {
      '/api': {
        target: process.env.VITE_API_TARGET ?? 'http://localhost:8080',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            // Le navigateur joint un en-tete Origin meme sur un POST
            // same-origin. Une fois relaye, il ferait echouer le controle
            // CORS de Spring alors que cet appel est serveur-a-serveur et
            // n'a aucun contexte CORS. On le retire.
            proxyReq.removeHeader('origin')
          })
        },
      },
    },
  },
})
