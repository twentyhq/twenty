import type { RefObject } from 'react';

import type { HeadingCardType } from '@/sections/Helped/types/HeadingCard';
import { theme } from '@/theme';

const CARD_WIDTH_DESKTOP = 443;
const CARD_WIDTH_MOBILE = 360;
const FADE_FRACTION = 0.15;
const PRE_STICKY_REVEAL_VIEWPORT_FRACTION = 0.35;
const CARD_TRAVEL_RANGE = 0.5;
const CARD_TRAVEL_START = 0.05;
const CARD_TRAVEL_STEP = 0.3;
const POST_STICKY_PARALLAX_DISTANCE = 0.7;

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function easeOutQuad(value: number) {
  const clampedValue = clamp01(value);

  return 1 - (1 - clampedValue) * (1 - clampedValue);
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

function getProgressScale(
  cards: readonly HeadingCardType[],
  cardRefs: RefObject<(HTMLDivElement | null)[]>,
  inner: HTMLDivElement,
  innerHeight: number,
) {
  const exitTargetNode = inner.querySelector('[data-helped-exit-target]');
  const lastCardNode = cardRefs.current[cards.length - 1];

  if (!(exitTargetNode instanceof HTMLElement) || !lastCardNode) {
    return 1;
  }

  const exitTargetTop =
    exitTargetNode.getBoundingClientRect().top -
    inner.getBoundingClientRect().top;
  const lastCardHeight = lastCardNode.offsetHeight;
  const lastCardStart =
    CARD_TRAVEL_START + (cards.length - 1) * CARD_TRAVEL_STEP;
  const requiredTravel = clamp01(
    (innerHeight * 1.1 + lastCardHeight - exitTargetTop) / (innerHeight * 1.4),
  );

  return lastCardStart + requiredTravel * CARD_TRAVEL_RANGE;
}

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
  const sectionRect = section.getBoundingClientRect();

  const scrollRange = Math.max(1, section.offsetHeight - window.innerHeight);
  const preStickyRevealOffset =
    window.innerHeight * PRE_STICKY_REVEAL_VIEWPORT_FRACTION;
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
  });

  const progressScale = getProgressScale(
    cards,
    refs.cardRefs,
    inner,
    innerHeight,
  );
  const progress =
    clamp01(
      (preStickyRevealOffset - sectionRect.top) /
        (scrollRange + preStickyRevealOffset),
    ) * progressScale;
  const postStickyParallaxOffset =
    easeOutQuad(
      (window.innerHeight - sectionRect.bottom) / window.innerHeight,
    ) *
    innerHeight *
    POST_STICKY_PARALLAX_DISTANCE;

  cards.forEach((_, index) => {
    const node = refs.cardRefs.current[index];
    if (!node) {
      return;
    }

    if (reducedMotion) {
      node.style.opacity = '1';
      node.style.top = `${innerHeight * (0.15 + index * 0.25)}px`;
      return;
    }

    const cardStart = CARD_TRAVEL_START + index * CARD_TRAVEL_STEP;
    const travel = clamp01((progress - cardStart) / CARD_TRAVEL_RANGE);

    node.style.top = `${innerHeight * (1.1 - travel * 1.4) - postStickyParallaxOffset}px`;
    node.style.opacity = String(
      Math.min(
        clamp01(travel / FADE_FRACTION),
        clamp01((1 - travel) / FADE_FRACTION),
      ),
    );
  });
}
