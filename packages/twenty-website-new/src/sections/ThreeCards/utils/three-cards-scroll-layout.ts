import type { RefObject } from 'react';

import { theme } from '@/theme';

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function easeOutQuint(t: number) {
  return 1 - Math.pow(1 - t, 5);
}

export type ThreeCardsScrollLayoutRefs = {
  cardRefs: RefObject<(HTMLDivElement | null)[]>;
  gridRef: RefObject<HTMLDivElement | null>;
};

const STAGGER = 0.25;

export function applyThreeCardsScrollLayout(
  refs: ThreeCardsScrollLayoutRefs,
  cardCount: number,
): void {
  const grid = refs.gridRef.current;
  if (!grid) {
    return;
  }

  const isDesktop = window.matchMedia(
    `(min-width: ${theme.breakpoints.md}px)`,
  ).matches;

  if (!isDesktop) {
    for (let index = 0; index < cardCount; index++) {
      const node = refs.cardRefs.current[index];
      if (!node) {
        continue;
      }
      node.style.opacity = '1';
      node.style.transform = 'none';
    }
    return;
  }

  const rect = grid.getBoundingClientRect();
  const viewportHeight = window.innerHeight;

  const startEdge = viewportHeight;
  const endEdge = viewportHeight * 0.2;
  const progress = clamp01((startEdge - rect.top) / (startEdge - endEdge));

  for (let index = 0; index < cardCount; index++) {
    const node = refs.cardRefs.current[index];
    if (!node) {
      continue;
    }

    const delay = index * STAGGER;
    const localProgress = clamp01((progress - delay) / (1 - delay));
    const eased = easeOutQuint(localProgress);

    const translateY = (1 - eased) * 200;
    const scale = 0.88 + eased * 0.12;
    const opacity = clamp01(localProgress / 0.4);

    node.style.opacity = String(opacity);
    node.style.transform = `translateY(${translateY}px) scale(${scale})`;
  }
}
