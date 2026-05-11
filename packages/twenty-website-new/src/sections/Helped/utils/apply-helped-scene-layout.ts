import { getPrefersReducedMotionSnapshot } from '@/lib/motion';
import { getStepperMdUpSnapshot } from '@/sections/Stepper';

import { createHelpedSceneLayoutState } from './create-helped-scene-layout-state';
import type { HeadingCardType } from '../types/heading-card-type';
import type { HelpedSceneLayoutRefs } from '../types/helped-scene-layout-refs';
import type { HelpedSceneLayoutState } from '../types/helped-scene-layout-state';

const CARD_WIDTH_DESKTOP = 443;
const CARD_WIDTH_MOBILE = 360;
const FADE_FRACTION = 0.15;
const PRE_STICKY_REVEAL_VIEWPORT_FRACTION = 0.35;
const CARD_TRAVEL_RANGE = 0.5;
const CARD_TRAVEL_START = 0.05;
const CARD_TRAVEL_STEP = 0.3;
const POST_STICKY_PARALLAX_DISTANCE = 0.7;

type HelpedSceneLayoutMeasurements = {
  cardCount: number;
  cardWidth: number;
  innerHeight: number;
  innerWidth: number;
  isDesktop: boolean;
  progressMetrics: HelpedSceneProgressMetrics | null;
  progressScale: number;
  sectionHeight: number;
  viewportHeight: number;
};

type HelpedSceneProgressMetrics = {
  exitTargetTop: number;
  lastCardHeight: number;
};

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function easeOutQuad(value: number) {
  const clampedValue = clamp01(value);

  return 1 - (1 - clampedValue) * (1 - clampedValue);
}

function setStyleProperty(
  node: HTMLElement,
  property: 'opacity' | 'transform' | 'width' | 'zIndex',
  value: string,
) {
  if (node.style[property] === value) {
    return;
  }

  node.style[property] = value;
}

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

function toStableLayoutMetric(value: number) {
  return Math.round(value * 100) / 100;
}

function readProgressScaleMetrics(
  refs: HelpedSceneLayoutRefs,
  cards: readonly HeadingCardType[],
  inner: HTMLDivElement,
): HelpedSceneProgressMetrics | null {
  const exitTargetNode = inner.querySelector('[data-helped-exit-target]');
  const lastCardNode = refs.cardRefs.current[cards.length - 1];

  if (!(exitTargetNode instanceof HTMLElement) || !lastCardNode) {
    return null;
  }

  const exitTargetTop =
    exitTargetNode.getBoundingClientRect().top -
    inner.getBoundingClientRect().top;

  return {
    exitTargetTop: toStableLayoutMetric(exitTargetTop),
    lastCardHeight: lastCardNode.offsetHeight,
  };
}

function getProgressScale(
  cards: readonly HeadingCardType[],
  innerHeight: number,
  progressMetrics: HelpedSceneProgressMetrics | null,
) {
  if (progressMetrics === null) {
    return 1;
  }

  const lastCardStart =
    CARD_TRAVEL_START + (cards.length - 1) * CARD_TRAVEL_STEP;
  const requiredTravel = clamp01(
    (innerHeight * 1.1 +
      progressMetrics.lastCardHeight -
      progressMetrics.exitTargetTop) /
      (innerHeight * 1.4),
  );

  return lastCardStart + requiredTravel * CARD_TRAVEL_RANGE;
}

function areProgressMetricsEqual(
  left: HelpedSceneProgressMetrics | null,
  right: HelpedSceneProgressMetrics | null,
) {
  if (left === null || right === null) {
    return left === right;
  }

  return (
    left.exitTargetTop === right.exitTargetTop &&
    left.lastCardHeight === right.lastCardHeight
  );
}

function getCardWidth(innerWidth: number, isDesktop: boolean) {
  return Math.max(
    0,
    Math.min(
      isDesktop ? CARD_WIDTH_DESKTOP : CARD_WIDTH_MOBILE,
      innerWidth - 64,
    ),
  );
}

function shouldRecomputeMeasurements(
  measurements: HelpedSceneLayoutMeasurements,
  nextMeasurements: Omit<
    HelpedSceneLayoutMeasurements,
    'cardWidth' | 'progressScale'
  >,
) {
  return (
    measurements.cardCount !== nextMeasurements.cardCount ||
    measurements.innerHeight !== nextMeasurements.innerHeight ||
    measurements.innerWidth !== nextMeasurements.innerWidth ||
    measurements.isDesktop !== nextMeasurements.isDesktop ||
    !areProgressMetricsEqual(
      measurements.progressMetrics,
      nextMeasurements.progressMetrics,
    ) ||
    measurements.sectionHeight !== nextMeasurements.sectionHeight ||
    measurements.viewportHeight !== nextMeasurements.viewportHeight
  );
}

function measureHelpedSceneLayout(
  refs: HelpedSceneLayoutRefs,
  cards: readonly HeadingCardType[],
  inner: HTMLDivElement,
  nextMeasurements: Omit<
    HelpedSceneLayoutMeasurements,
    'cardWidth' | 'progressScale'
  >,
): HelpedSceneLayoutMeasurements {
  const cardWidth = getCardWidth(
    nextMeasurements.innerWidth,
    nextMeasurements.isDesktop,
  );

  cards.forEach((_, index) => {
    const node = refs.cardRefs.current[index];
    if (!node) {
      return;
    }

    setStyleProperty(node, 'width', `${cardWidth}px`);
    setStyleProperty(node, 'zIndex', String(10 + index));
  });

  const progressMetrics = readProgressScaleMetrics(refs, cards, inner);

  return {
    ...nextMeasurements,
    cardWidth,
    progressMetrics,
    progressScale: getProgressScale(
      cards,
      nextMeasurements.innerHeight,
      progressMetrics,
    ),
  };
}

export function applyHelpedSceneLayout(
  refs: HelpedSceneLayoutRefs,
  cards: readonly HeadingCardType[],
  state: HelpedSceneLayoutState = createHelpedSceneLayoutState(),
): void {
  const section = refs.sectionRef.current;
  const inner = refs.innerRef.current;
  if (!section || !inner) {
    return;
  }

  const reducedMotion = getPrefersReducedMotionSnapshot();
  const isDesktop = getStepperMdUpSnapshot();
  const sectionRect = section.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  const preStickyRevealOffset =
    viewportHeight * PRE_STICKY_REVEAL_VIEWPORT_FRACTION;
  const nextMeasurements = {
    cardCount: cards.length,
    innerHeight: inner.clientHeight,
    innerWidth: inner.clientWidth,
    isDesktop,
    progressMetrics: readProgressScaleMetrics(refs, cards, inner),
    sectionHeight: sectionRect.height,
    viewportHeight,
  };

  let measurements = state.measurements;
  if (
    measurements === null ||
    shouldRecomputeMeasurements(measurements, nextMeasurements)
  ) {
    measurements = measureHelpedSceneLayout(
      refs,
      cards,
      inner,
      nextMeasurements,
    );
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

  cards.forEach((_, index) => {
    const node = refs.cardRefs.current[index];
    if (!node) {
      return;
    }

    if (reducedMotion) {
      const x = cardLeft(index, innerWidth, cardWidth, isDesktop);
      const y = innerHeight * (0.15 + index * 0.25);

      setStyleProperty(node, 'opacity', '1');
      setStyleProperty(node, 'transform', `translate3d(${x}px, ${y}px, 0)`);
      return;
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
  });
}
