import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// Pull version from package.json so the UI stays in sync with releases.
const pkg = JSON.parse(
	readFileSync(fileURLToPath(new URL("./package.json", import.meta.url)), "utf-8"),
) as { version: string };

// https://vite.dev/config/
export default defineConfig(() => {
	const base = "/";
	return {
	base,
	define: {
		__APP_VERSION__: JSON.stringify(pkg.version),
	},
	plugins: [
		react(),
		VitePWA({
			registerType: "autoUpdate",
			includeAssets: ["favicon.ico", "favicon.svg", "favicon-96x96.png", "apple-touch-icon.png"],
			manifest: {
				name: "Hero: Tales of the Tomes Health Tracker",
				short_name: "Hero Tracker",
				description:
					"Track HP, Mana, Armor, and custom stats for your heroes",
				theme_color: "#1a1a2e",
				background_color: "#1a1a2e",
				display: "standalone",
				scope: base,
				start_url: base,
				orientation: "portrait-primary",
				icons: [
					{
						src: "web-app-manifest-192x192.png",
						sizes: "192x192",
						type: "image/png",
						purpose: "maskable",
					},
					{
						src: "web-app-manifest-512x512.png",
						sizes: "512x512",
						type: "image/png",
						purpose: "maskable",
					},
				],
			},
			workbox: {
				globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
				maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MB
			},
			devOptions: {
				enabled: true,
				type: "module",
			},
		}),
	],
};
});
