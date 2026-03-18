import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
	base: "/hero-tracker/",
	plugins: [
		react(),
		VitePWA({
			registerType: "autoUpdate",
			includeAssets: ["icons/*.png"],
			manifest: {
				name: "Hero: Tales of the Tomes Health Tracker",
				short_name: "Hero Tracker",
				description:
					"Track HP, Mana, Armor, and custom stats for your heroes",
				theme_color: "#1a1a2e",
				background_color: "#1a1a2e",
				display: "standalone",
				scope: "/hero-tracker/",
				start_url: "/hero-tracker/",
				orientation: "portrait-primary",
				icons: [
					{
						src: "icons/icon-192x192.png",
						sizes: "192x192",
						type: "image/png",
					},
					{
						src: "icons/icon-512x512.png",
						sizes: "512x512",
						type: "image/png",
					},
					{
						src: "icons/icon-512x512.png",
						sizes: "512x512",
						type: "image/png",
						purpose: "any maskable",
					},
				],
			},
			workbox: {
				globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
			},
			devOptions: {
				enabled: true,
				type: "module",
			},
		}),
	],
});
