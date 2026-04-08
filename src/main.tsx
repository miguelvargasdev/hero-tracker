import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { HERO_TEMPLATES } from './data/heroes.ts'

const BASE = import.meta.env.BASE_URL;

// Every image the app needs before its first interaction is meaningful.
// The splash in index.html stays visible until all of these have loaded
// (or failed) so the user never sees a blank/half-loaded screen.
const CRITICAL_IMAGES: string[] = [
  `${BASE}crown.png`,
  `${BASE}menu-bg.jpg`,
  `${BASE}icons/health.png`,
  `${BASE}icons/attack.png`,
  `${BASE}icons/armor.png`,
  `${BASE}icons/mana.png`,
  ...HERO_TEMPLATES.flatMap((t) => [t.image, t.wideImage]),
];

// Minimum time the splash stays visible, even if images load faster.
const MIN_SPLASH_MS = 1000;

function loadImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve(); // never block on a broken asset
    img.src = src;
  });
}

const splashStart = performance.now();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

Promise.all(CRITICAL_IMAGES.map(loadImage)).then(() => {
  const elapsed = performance.now() - splashStart;
  const wait = Math.max(0, MIN_SPLASH_MS - elapsed);
  setTimeout(() => {
    const splash = document.getElementById('splash');
    if (!splash) return;
    splash.classList.add('splash-hidden');
    splash.addEventListener('transitionend', () => splash.remove(), { once: true });
  }, wait);
});
