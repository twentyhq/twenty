import { type RefObject } from 'react';

import { getReducedMotionSnapshot } from '@/platform/motion/reduced-motion-snapshot';
import { BREAKPOINT_PX } from '@/tokens';

// Scroll-driven card fan: cards travel up through the sticky stage in a
// staggered sequence, fading at both ends, with a parallax hand-off as the
// section leaves. Ported math; values are the authored choreography.
const CARD_WIDTH_DESKTOP = 443;
const CARD_WIDTH_MOBILE = 360;
const FADE_FRACTION = 0.15;
const PRE_STICKY_REVEAL_VIEWPORT_FRACTION = 0.35;
const CARD_TRAVEL_RANGE = 0.5;
const CARD_TRAVEL_START = 0.05;
const CARD_TRAVEL_STEP = 0.3;
const POST_STICKY_PARALLAX_DISTANCE = 0.7;

export type HelpedSceneLayoutRefs = {
  cardRefs: RefObject<(HTMLDivElement | null)[]>;
  innerRef: RefObject<HTMLDivElement | null>;
  sectionRef: RefObject<HTMLDivElement | null>;
};

type ProgressMetrics = { exitTargetTop: number; lastCardHeight: number };

type Measurements = {
  cardCount: number;
  cardWidth: number;
  innerHeight: number;
  innerWidth: number;
  isDesktop: boolean;
  progressMetrics: ProgressMetrics | null;
  progressScale: number;
  sectionHeight: number;
  viewportHeight: number;
};

export type HelpedSceneLayoutState = { measurements: Measurements | null };

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const easeOutQuad = (value: number) => {
  const clamped = clamp01(value);
  return 1 - (1 - clamped) * (1 - clamped);
};

const setStyleProperty = (
  node: HTMLElement,
  property: 'opacity' | 'transform' | 'width' | 'zIndex',
  value: string,
) => {
  if (node.style[property] === value) return;
  node.style[property] = value;
};

const cardLeft = (
  index: number,
  innerWidth: number,
  cardWidth: number,
  isDesktop: boolean,
): number => {
  if (!isDesktop) return (innerWidth - cardWidth) / 2;
  if (index === 0) return innerWidth - cardWidth - innerWidth * 0.035;
  if (index === 1) return innerWidth * 0.03;
  return (innerWidth - cardWidth) / 2;
};

const toStableMetric = (value: number) => Math.round(value * 100) / 100;

const readProgressMetrics = (
  refs: HelpedSceneLayoutRefs,
  cardCount: number,
  inner: HTMLDivElement,
): ProgressMetrics | null => {
  const exitTarget = inner.querySelector('[data-helped-exit-target]');
  const lastCard = refs.cardRefs.current[cardCount - 1];
  if (!(exitTarget instanceof HTMLElement) || !lastCard) return null;
  return {
    exitTargetTop: toStableMetric(
      exitTarget.getBoundingClientRect().top -
        inner.getBoundingClientRect().top,
    ),
    lastCardHeight: lastCard.offsetHeight,
  };
};

const getProgressScale = (
  cardCount: number,
  innerHeight: number,
  metrics: ProgressMetrics | null,
) => {
  if (metrics === null) return 1;
  const lastCardStart = CARD_TRAVEL_START + (cardCount - 1) * CARD_TRAVEL_STEP;
  const requiredTravel = clamp01(
    (innerHeight * 1.1 + metrics.lastCardHeight - metrics.exitTargetTop) /
      (innerHeight * 1.4),
  );
  return lastCardStart + requiredTravel * CARD_TRAVEL_RANGE;
};

const metricsEqual = (a: ProgressMetrics | null, b: ProgressMetrics | null) => {
  if (a === null || b === null) return a === b;
  return (
    a.exitTargetTop === b.exitTargetTop && a.lastCardHeight === b.lastCardHeight
  );
};

const needsRemeasure = (
  current: Measurements,
  next: Omit<Measurements, 'cardWidth' | 'progressScale'>,
) =>
  current.cardCount !== next.cardCount ||
  current.innerHeight !== next.innerHeight ||
  current.innerWidth !== next.innerWidth ||
  current.isDesktop !== next.isDesktop ||
  !metricsEqual(current.progressMetrics, next.progressMetrics) ||
  current.sectionHeight !== next.sectionHeight ||
  current.viewportHeight !== next.viewportHeight;

export function applyHelpedSceneLayout(
  refs: HelpedSceneLayoutRefs,
  cardCount: number,
  state: HelpedSceneLayoutState,
): void {
  const section = refs.sectionRef.current;
  const inner = refs.innerRef.current;
  if (!section || !inner) return;

  const reducedMotion = getReducedMotionSnapshot();
  const isDesktop = window.matchMedia(
    `(min-width: ${BREAKPOINT_PX.md}px)`,
  ).matches;
  const sectionRect = section.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  const preStickyRevealOffset =
    viewportHeight * PRE_STICKY_REVEAL_VIEWPORT_FRACTION;

  const next = {
    cardCount,
    innerHeight: inner.clientHeight,
    innerWidth: inner.clientWidth,
    isDesktop,
    progressMetrics: readProgressMetrics(refs, cardCount, inner),
    sectionHeight: sectionRect.height,
    viewportHeight,
  };

  let measurements = state.measurements;
  if (measurements === null || needsRemeasure(measurements, next)) {
    const cardWidth = Math.max(
      0,
      Math.min(
        isDesktop ? CARD_WIDTH_DESKTOP : CARD_WIDTH_MOBILE,
        next.innerWidth - 64,
      ),
    );
    for (let index = 0; index < cardCount; index += 1) {
      const node = refs.cardRefs.current[index];
      if (!node) continue;
      setStyleProperty(node, 'width', `${cardWidth}px`);
      setStyleProperty(node, 'zIndex', String(10 + index));
    }
    measurements = {
      ...next,
      cardWidth,
      progressMetrics: readProgressMetrics(refs, cardCount, inner),
      progressScale: getProgressScale(
        cardCount,
        next.innerHeight,
        next.progressMetrics,
      ),
    };
    state.measurements = measurements;
  }

  const { cardWidth, innerHeight, innerWidth, progressScale, sectionHeight } =
    measurements;
  const scrollRange = Math.max(1, sectionHeight - viewportHeight);
  const progress =
    clamp01(
      (preStickyRevealOffset - sectionRect.top) /
        (scrollRange + preStickyRevealOffset),
    ) * progressScale;
  const postStickyParallaxOffset =
    easeOutQuad((viewportHeight - sectionRect.bottom) / viewportHeight) *
    innerHeight *
    POST_STICKY_PARALLAX_DISTANCE;

  for (let index = 0; index < cardCount; index += 1) {
    const node = refs.cardRefs.current[index];
    if (!node) continue;

    if (reducedMotion) {
      const x = cardLeft(index, innerWidth, cardWidth, isDesktop);
      const y = innerHeight * (0.15 + index * 0.25);
      setStyleProperty(node, 'opacity', '1');
      setStyleProperty(node, 'transform', `translate3d(${x}px, ${y}px, 0)`);
      continue;
    }

    const cardStart = CARD_TRAVEL_START + index * CARD_TRAVEL_STEP;
    const travel = clamp01((progress - cardStart) / CARD_TRAVEL_RANGE);
    const x = cardLeft(index, innerWidth, cardWidth, isDesktop);
    const y = innerHeight * (1.1 - travel * 1.4) - postStickyParallaxOffset;
    const opacity = Math.min(
      clamp01(travel / FADE_FRACTION),
      clamp01((1 - travel) / FADE_FRACTION),
    );
    setStyleProperty(node, 'opacity', String(opacity));
    setStyleProperty(node, 'transform', `translate3d(${x}px, ${y}px, 0)`);
  }
}
