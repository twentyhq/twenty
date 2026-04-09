import type { RefObject } from 'react';

import type { HeadingCardType } from '@/sections/Helped/types/HeadingCard';
import { theme } from '@/theme';

const CARD_WIDTH_DESKTOP = 443;
const CARD_WIDTH_MOBILE = 360;
const PROGRESS_SCALE = 1.25;
const FADE_FRACTION = 0.15;

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

// Right, left, center for cards 0, 1, 2+
function cardLeft(
  index: number,
  innerWidth: number,
  cardWidth: number,
  isDesktop: boolean,
): number {
  if (!isDesktop) {
    return (innerWidth - cardWidth) / 2;
  }
  if (index === 0) {
    return innerWidth - cardWidth - innerWidth * 0.035;
  }
  if (index === 1) {
    return innerWidth * 0.03;
  }
  return (innerWidth - cardWidth) / 2;
}

export type HelpedSceneLayoutRefs = {
  cardRefs: RefObject<(HTMLDivElement | null)[]>;
  innerRef: RefObject<HTMLDivElement | null>;
  sectionRef: RefObject<HTMLElement | null>;
};

export function applyHelpedSceneLayout(
  refs: HelpedSceneLayoutRefs,
  cards: readonly HeadingCardType[],
): void {
  const section = refs.sectionRef.current;
  const inner = refs.innerRef.current;
  if (!section || !inner) {
    return;
  }

  const reducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches;
  const isDesktop = window.matchMedia(
    `(min-width: ${theme.breakpoints.md}px)`,
  ).matches;

  const scrollRange = Math.max(1, section.offsetHeight - window.innerHeight);
  const progress =
    clamp01(-section.getBoundingClientRect().top / scrollRange) * PROGRESS_SCALE;

  const innerWidth = inner.offsetWidth;
  const innerHeight = inner.offsetHeight;
  const cardWidth = Math.min(
    isDesktop ? CARD_WIDTH_DESKTOP : CARD_WIDTH_MOBILE,
    innerWidth - 64,
  );

  cards.forEach((_, index) => {
    const node = refs.cardRefs.current[index];
    if (!node) {
      return;
    }

    node.style.width = `${cardWidth}px`;
    node.style.zIndex = String(10 + index);
    node.style.left = `${cardLeft(index, innerWidth, cardWidth, isDesktop)}px`;

    if (reducedMotion) {
      node.style.opacity = '1';
      node.style.top = `${innerHeight * (0.15 + index * 0.25)}px`;
      return;
    }

    // Card 1: 0.05–0.55, Card 2: 0.35–0.85, Card 3: 0.65–1.15
    const cardStart = 0.05 + index * 0.3;
    const travel = clamp01((progress - cardStart) / 0.5);

    node.style.top = `${innerHeight * (1.1 - travel * 1.4)}px`;
    node.style.opacity = String(
      Math.min(
        clamp01(travel / FADE_FRACTION),
        clamp01((1 - travel) / FADE_FRACTION),
      ),
    );
  });
}
