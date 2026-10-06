import { defineConfig } from 'vite'
import { loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), 'VITE_')
	const configuredApi = env.VITE_BASE_URL || 'http://localhost:3000/api/v1'
	const apiOrigin = new URL(configuredApi, 'http://localhost:3000').origin

	return {
		plugins: [react()],
		server: {
			proxy: {
				'/api': {
					target: apiOrigin,
					changeOrigin: true,
				},
			},
		},
	}
})
