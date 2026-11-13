import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'
import { apiProxy, API_PROXY_PATH } from './dev/api-proxy.ts'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  const proxy = apiProxy(env.VITE_API_URL || 'https://api.silverbox.perlin.com.br')
  return {
    plugins: [react(), tailwindcss(), ...(command === 'serve' ? [proxy.plugin] : [])],
    server: { host: 'localhost', proxy: { [API_PROXY_PATH]: proxy.options } },
  }
})
