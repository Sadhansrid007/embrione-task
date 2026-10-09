'use client';

// Checks if the user prefers reduced motion
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Safely initializes dynamic scroll scrubbing handlers
export async function initScrollScrubber(
  targetSelector: string,
  onProgress?: (progress: number) => void
) {
  if (prefersReducedMotion() || typeof window === 'undefined') return;

  try {
    const animeModule = await import('animejs');
    const { onScroll } = animeModule;

    const elements = document.querySelectorAll(targetSelector);
    elements.forEach((el) => {
      if (onScroll) {
        onScroll({
          target: el,
          enter: 'top bottom',
          leave: 'bottom top',
          sync: true,
          onUpdate: (self: { progress: number }) => {
            if (onProgress) onProgress(self.progress);
          },
        });
      }
    });
  } catch (err) {
    console.warn('Motion engine dynamic fallback:', err);
  }
}