// Single source of truth for the in-app version string. The raw number is
// injected by Vite from package.json via `define` (see vite.config.ts).
export const APP_VERSION = __APP_VERSION__;
export const APP_VERSION_DISPLAY = `v${__APP_VERSION__}`;
