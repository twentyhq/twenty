import type { RefObject } from 'react';

import type { HeadingCardType } from '@/sections/Helped/types/HeadingCard';
import { theme } from '@/theme';

export const CARD_WIDTH_DESKTOP = 443;
const CARD_WIDTH_MOBILE_MAX = 360;
const HORIZONTAL_PAD = 32;

// Scroll progress 0..1 through the tall section
const HEADLINE_FADE_START = 0.76;
const HEADLINE_FADE_END = 0.92;
const HEADLINE_LIFT_PX = 48;

// Each card fades/slides in over the same window, shifted along the scroll
const CARD_WINDOW = 0.2;
const CARD_STAGGER = 0.12;
const CARD_FIRST_START = 0.06;
const ENTER_OFFSET_Y_RATIO = 0.34;

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
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
  const progress = clamp01(-rect.top / scrollRange);

  const innerWidth = inner.offsetWidth;
  const innerHeight = inner.offsetHeight;
  const cardWidth = Math.min(
    isDesktop ? CARD_WIDTH_DESKTOP : CARD_WIDTH_MOBILE_MAX,
    innerWidth - HORIZONTAL_PAD * 2,
  );

  if (headlineRef.current) {
    const headlineT = clamp01(
      (progress - HEADLINE_FADE_START) /
        (HEADLINE_FADE_END - HEADLINE_FADE_START),
    );
    headlineRef.current.style.opacity = String(1 - headlineT);
    headlineRef.current.style.transform = `translate3d(0, ${-headlineT * HEADLINE_LIFT_PX}px, 0)`;
  }

  const enterOffsetY = innerHeight * ENTER_OFFSET_Y_RATIO;

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
    const cardT = clamp01(
      (progress - windowStart) / (windowEnd - windowStart),
    );

    node.style.left = `${restLeft}px`;
    node.style.top = `${restTop + enterOffsetY * (1 - cardT)}px`;
    node.style.opacity = String(cardT);
  });
}
