import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	build: {
		assetsInlineLimit: 0 // zakáže inlinování úplně
	},
	server: {
		host: '0.0.0.0',
		port: 5173
	}
});
