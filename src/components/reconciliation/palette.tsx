import { useEffect } from 'react';
let applied = false;
export function VisitPalette() {
  useEffect(() => {
    if (applied) return; applied = true;
    let last = -1;
    try { last = Number(localStorage.getItem('er-last-palette') ?? -1); } catch { /* Storage is optional. */ }
    const choices = [0, 1, 2, 3, 4].filter(i => i !== last);
    let index = choices[Math.floor(Math.random() * choices.length)] ?? 0;
    try {
      const previous = JSON.parse(sessionStorage.getItem('er-palette-visit') ?? 'null') as { index: number; at: number } | null;
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
      if (navigation?.type !== 'reload' && previous && Date.now() - previous.at < 8000 && [0, 1, 2, 3, 4].includes(previous.index)) index = previous.index;
      sessionStorage.setItem('er-palette-visit', JSON.stringify({ index, at: Date.now() }));
      localStorage.setItem('er-last-palette', String(index));
    } catch { /* Session palette remains usable. */ }
    document.documentElement.dataset['palette'] = String(index);
  }, []);
  return null;
}
