import { type RefObject } from 'react';

import { getReducedMotionSnapshot } from '@/platform/motion/reduced-motion-snapshot';
import { BREAKPOINT_PX } from '@/tokens';

import { cardReveal } from './card-reveal-frame';

export type CardRevealLayoutRefs = {
  cardRefs: RefObject<(HTMLDivElement | null)[]>;
  gridRef: RefObject<HTMLDivElement | null>;
};

const setStyleProperty = (
  node: HTMLElement,
  property: 'opacity' | 'transform',
  value: string,
) => {
  if (node.style[property] === value) return;
  node.style[property] = value;
};

// Scroll-driven staggered reveal of the card grid (desktop only; mobile
// stacks stay settled, as on the old site). Reduced motion settles the
// cards too — a designed divergence from the old site, which animated
// regardless.
export function applyCardRevealLayout(
  refs: CardRevealLayoutRefs,
  cardCount: number,
): void {
  const grid = refs.gridRef.current;

  if (!grid) {
    return;
  }

  const isDesktop = window.matchMedia(
    `(min-width: ${BREAKPOINT_PX.md}px)`,
  ).matches;
  const settled = !isDesktop || getReducedMotionSnapshot();

  if (settled) {
    for (let index = 0; index < cardCount; index += 1) {
      const node = refs.cardRefs.current[index];

      if (!node) {
        continue;
      }
      setStyleProperty(node, 'opacity', '1');
      setStyleProperty(node, 'transform', 'none');
    }
    return;
  }

  const progress = cardReveal.progressForGridTop(
    grid.getBoundingClientRect().top,
    window.innerHeight,
  );

  for (let index = 0; index < cardCount; index += 1) {
    const node = refs.cardRefs.current[index];

    if (!node) {
      continue;
    }
    const frame = cardReveal.frameAt(progress, index);
    setStyleProperty(node, 'opacity', String(frame.opacity));
    setStyleProperty(
      node,
      'transform',
      `translateY(${frame.translateYPx}px) scale(${frame.scale})`,
    );
  }
}
