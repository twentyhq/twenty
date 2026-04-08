import type { RefObject } from 'react';

import type { HeadingCardType } from '@/sections/Helped/types/HeadingCard';
import { theme } from '@/theme';

export const CARD_WIDTH_DESKTOP = 443;
const CARD_WIDTH_MOBILE_MAX = 360;
const HORIZONTAL_PAD = 32;

const CARD_WINDOW = 0.2;
const CARD_STAGGER = 0.12;
const CARD_FIRST_START = 0.06;
const ENTER_OFFSET_Y_RATIO = 0.34;
const EXIT_LIFT_Y_RATIO = 0.28;

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function allCardsFullyInEnd(cardCount: number): number {
  if (cardCount <= 0) {
    return CARD_FIRST_START;
  }
  const lastIndex = cardCount - 1;
  return CARD_FIRST_START + lastIndex * CARD_STAGGER + CARD_WINDOW;
}

function cardRestPosition(
  index: number,
  innerWidth: number,
  innerHeight: number,
  cardWidth: number,
  isDesktop: boolean,
): { left: number; top: number } {
  if (isDesktop) {
    if (index === 0) {
      return {
        left: innerWidth - cardWidth - innerWidth * 0.035,
        top: innerHeight * 0.08,
      };
    }
    if (index === 1) {
      return {
        left: innerWidth * 0.03,
        top: innerHeight * 0.3,
      };
    }
    return {
      left: (innerWidth - cardWidth) / 2,
      top: innerHeight * 0.52,
    };
  }

  return {
    left: (innerWidth - cardWidth) / 2,
    top: innerHeight * 0.36 + index * 0.06 * innerHeight,
  };
}

export type HelpedSceneLayoutRefs = {
  cardRefs: RefObject<(HTMLDivElement | null)[]>;
  headlineRef: RefObject<HTMLDivElement | null>;
  innerRef: RefObject<HTMLDivElement | null>;
  sectionRef: RefObject<HTMLElement | null>;
};

export function applyHelpedSceneLayout(
  refs: HelpedSceneLayoutRefs,
  cards: readonly HeadingCardType[],
): void {
  const { sectionRef, innerRef, headlineRef, cardRefs } = refs;
  const section = sectionRef.current;
  const inner = innerRef.current;
  if (!section || !inner) {
    return;
  }

  const reducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches;
  const isDesktop = window.matchMedia(
    `(min-width: ${theme.breakpoints.md}px)`,
  ).matches;

  const rect = section.getBoundingClientRect();
  const scrollRange = Math.max(1, section.offsetHeight - window.innerHeight);
  const cardProgress = clamp01(-rect.top / scrollRange);

  const innerWidth = inner.offsetWidth;
  const innerHeight = inner.offsetHeight;
  const cardWidth = Math.min(
    isDesktop ? CARD_WIDTH_DESKTOP : CARD_WIDTH_MOBILE_MAX,
    innerWidth - HORIZONTAL_PAD * 2,
  );

  if (headlineRef.current) {
    headlineRef.current.style.opacity = '1';
    headlineRef.current.style.transform = 'none';
  }

  const enterOffsetY = innerHeight * ENTER_OFFSET_Y_RATIO;
  const exitLiftY = innerHeight * EXIT_LIFT_Y_RATIO;
  const allInEnd = allCardsFullyInEnd(cards.length);
  const exitStart = allInEnd + 0.05;
  const exitEnd = Math.min(0.88, exitStart + 0.22);
  const exitT =
    cardProgress < exitStart
      ? 0
      : clamp01((cardProgress - exitStart) / (exitEnd - exitStart));

  cards.forEach((_, index) => {
    const node = cardRefs.current[index];
    if (!node) {
      return;
    }

    const { left: restLeft, top: restTop } = cardRestPosition(
      index,
      innerWidth,
      innerHeight,
      cardWidth,
      isDesktop,
    );

    node.style.width = `${cardWidth}px`;
    node.style.zIndex = String(10 + index);

    if (reducedMotion) {
      node.style.opacity = '1';
      node.style.transform = 'none';
      node.style.left = `${restLeft}px`;
      node.style.top = `${restTop}px`;
      return;
    }

    const windowStart = CARD_FIRST_START + index * CARD_STAGGER;
    const windowEnd = windowStart + CARD_WINDOW;
    const enterT = clamp01(
      (cardProgress - windowStart) / (windowEnd - windowStart),
    );
    const visibility = enterT * (1 - exitT);
    const restY = restTop + enterOffsetY * (1 - enterT);
    const topPx = restY - exitLiftY * exitT;

    node.style.left = `${restLeft}px`;
    node.style.top = `${topPx}px`;
    node.style.opacity = String(visibility);
  });
}
