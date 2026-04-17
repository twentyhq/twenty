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

export type ThreeCardsScrollLayoutOptions = {
  endEdgeRatio?: number;
  initialScale?: number;
  initialTranslateY?: number;
  opacityRamp?: number;
  stagger?: number;
};

const DEFAULT_SCROLL_LAYOUT_OPTIONS: Required<ThreeCardsScrollLayoutOptions> = {
  endEdgeRatio: 0.2,
  initialScale: 0.88,
  initialTranslateY: 200,
  opacityRamp: 0.4,
  stagger: 0.25,
};

export function applyThreeCardsScrollLayout(
  refs: ThreeCardsScrollLayoutRefs,
  cardCount: number,
  options: ThreeCardsScrollLayoutOptions = {},
): void {
  const {
    endEdgeRatio,
    initialScale,
    initialTranslateY,
    opacityRamp,
    stagger,
  } = { ...DEFAULT_SCROLL_LAYOUT_OPTIONS, ...options };

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
  const endEdge = viewportHeight * endEdgeRatio;
  const progress = clamp01((startEdge - rect.top) / (startEdge - endEdge));

  for (let index = 0; index < cardCount; index++) {
    const node = refs.cardRefs.current[index];
    if (!node) {
      continue;
    }

    const delay = index * stagger;
    const localProgress = clamp01(
      (progress - delay) / Math.max(1 - delay, Number.EPSILON),
    );
    const eased = easeOutQuint(localProgress);

    const translateY = (1 - eased) * initialTranslateY;
    const scale = initialScale + eased * (1 - initialScale);
    const opacity = clamp01(localProgress / opacityRamp);

    node.style.opacity = String(opacity);
    node.style.transform = `translateY(${translateY}px) scale(${scale})`;
  }
}
