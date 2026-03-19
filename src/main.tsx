import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { HERO_TEMPLATES } from './data/heroes.ts'

// Preload hero images so they're cached before the select modal opens
HERO_TEMPLATES.forEach((template) => {
  const img = new Image();
  img.src = template.image;
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
