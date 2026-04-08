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

function dismissSplash() {
  const splash = document.getElementById('splash');
  const splashLogo = document.getElementById('splash-logo') as HTMLImageElement | null;
  if (!splash || !splashLogo) {
    document.body.classList.remove('splash-active');
    return;
  }

  const cleanup = () => {
    document.body.classList.remove('splash-active');
    splash.remove();
  };

  // Phase 3 → fade the black backdrop to transparent, revealing the menu.
  const fadeBackdrop = () => {
    const fade = splash.animate(
      [{ backgroundColor: '#000' }, { backgroundColor: 'transparent' }],
      { duration: 500, easing: 'ease-out', fill: 'forwards' },
    );
    fade.onfinish = cleanup;
  };

  // If the main-menu logo is in the DOM, fly the splash logo into its slot
  // first, THEN fade the backdrop. Otherwise just fade out immediately.
  const target = document.querySelector<HTMLElement>('[data-splash-target="logo"]');

  if (target) {
    const targetRect = target.getBoundingClientRect();
    const logoRect = splashLogo.getBoundingClientRect();

    const dx =
      (targetRect.left + targetRect.width / 2) -
      (logoRect.left + logoRect.width / 2);
    const dy =
      (targetRect.top + targetRect.height / 2) -
      (logoRect.top + logoRect.height / 2);
    const scale = targetRect.width / logoRect.width;

    // Phase 2 → slide & scale into the menu's logo slot via WAAPI.
    const slide = splashLogo.animate(
      [
        { transform: 'translate(0px, 0px) scale(1)' },
        { transform: `translate(${dx}px, ${dy}px) scale(${scale})` },
      ],
      {
        duration: 700,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
        fill: 'forwards',
      },
    );
    slide.onfinish = fadeBackdrop;
  } else {
    fadeBackdrop();
  }
}

Promise.all(CRITICAL_IMAGES.map(loadImage)).then(() => {
  const elapsed = performance.now() - splashStart;
  const wait = Math.max(0, MIN_SPLASH_MS - elapsed);
  setTimeout(dismissSplash, wait);
});
