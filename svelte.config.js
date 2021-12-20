import adapter from "@sveltejs/adapter-auto";

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter(),

		// hydrate the <div id="svelte"> element in src/app.html
		target: "#svelte",
		// https://github.com/sveltejs/kit/issues/1134#issuecomment-968121292
		vite: {
			server: {
				hmr: {
					clientPort: 443
				}
			}
		}
	}
};

export default config;
