// Single source of truth for the in-app version string. The raw number is
// injected by Vite from package.json via `define` (see vite.config.ts).
export const APP_VERSION = __APP_VERSION__;

// True for the /dev/ preview build (see vite.config.ts's --mode dev), so the
// UI can flag itself as a dev build and avoid being mistaken for prod.
export const IS_DEV_BUILD = import.meta.env.BASE_URL === "/dev/";

export const APP_VERSION_DISPLAY = IS_DEV_BUILD
	? `v${__APP_VERSION__} (Dev Build)`
	: `v${__APP_VERSION__}`;
