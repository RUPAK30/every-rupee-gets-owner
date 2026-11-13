import { useEffect } from 'react';
let applied = false;
export function VisitPalette() {
  useEffect(() => {
    if (applied) return; applied = true;
    let last = -1;
    try { last = Number(localStorage.getItem('er-last-palette') ?? -1); } catch { /* Storage is optional. */ }
    const choices = [0, 1, 2, 3, 4].filter(i => i !== last);
    const index = choices[Math.floor(Math.random() * choices.length)] ?? 0;
    document.documentElement.dataset.palette = String(index);
    try { localStorage.setItem('er-last-palette', String(index)); } catch { /* Session palette remains usable. */ }
  }, []);
  return null;
}
