import type { RefObject } from 'react';

import { theme } from '@/theme';

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

export type ThreeCardsScrollLayoutRefs = {
  cardRefs: RefObject<(HTMLDivElement | null)[]>;
  sectionRef: RefObject<HTMLElement | null>;
};

export function applyThreeCardsScrollLayout(
  refs: ThreeCardsScrollLayoutRefs,
  cardCount: number,
): void {
  const section = refs.sectionRef.current;
  if (!section) {
    return;
  }

  const reducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches;
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

  const scrollRange = Math.max(1, section.offsetHeight - window.innerHeight);
  const progress = clamp01(-section.getBoundingClientRect().top / scrollRange);

  // Card 0 is always visible. Cards 1+ scroll up from below together,
  // with card 2 offset behind card 1 by STAGGER.
  const STAGGER = 0.25;
  const TRAVEL_PX = window.innerHeight * 0.4;

  for (let index = 0; index < cardCount; index++) {
    const node = refs.cardRefs.current[index];
    if (!node) {
      continue;
    }

    if (reducedMotion || index === 0) {
      node.style.opacity = '1';
      node.style.transform = 'none';
      continue;
    }

    const delay = (index - 1) * STAGGER;
    const localProgress = clamp01((progress - delay) / (1 - delay));

    const translateY = (1 - localProgress) * TRAVEL_PX;
    const opacity = clamp01(localProgress / 0.25);

    node.style.opacity = String(opacity);
    node.style.transform = `translateY(${translateY}px)`;
  }
}
