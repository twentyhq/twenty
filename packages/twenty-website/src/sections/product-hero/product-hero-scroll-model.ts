// The product hero's scroll choreography, as one pure function of the
// track's geometry. Every keyframe below is the old site's law; jest pins
// them. The component layer writes the continuous values to CSS custom
// properties and keeps React state only for the discrete flips.

import { clampProgress } from '@/platform/motion';
import { MENU_WIPE } from '@/tokens';

type HeroScrollInput = {
  // getBoundingClientRect().top of the 200vh track.
  trackTop: number;
  // The track's full height (offsetHeight).
  trackHeight: number;
  viewportHeight: number;
};

export type HeroScrollModel = {
  aiPanelProgress: number;
  aiPlaybackEnabled: boolean;
  aiPointerEventsEnabled: boolean;
  heroAtStart: boolean;
  introCursorsActive: boolean;
  isCrossing: boolean;
  menuBackground: string;
  menuElevated: boolean;
  menuDark: boolean;
  morphProgress: number;
  navProgress: number;
  selectorRevealProgress: number;
  selectorRevealReady: boolean;
  stackAppearProgress: number;
  stackAlignProgress: number;
  stackSpreadEasedProgress: number;
  stackSpreadProgress: number;
};

const NAV_HEIGHT_PX = 64;

// The morph plays out over the first 55% of the track's scrollable run.
const MORPH_START = 0;
const MORPH_END = 0.55;

function smoothstep(value: number): number {
  return value * value * (3 - 2 * value);
}

function mapToMorphProgress(scrollProgress: number): number {
  if (scrollProgress <= MORPH_START) return 0;
  if (scrollProgress >= MORPH_END) return 1;

  const linear = (scrollProgress - MORPH_START) / (MORPH_END - MORPH_START);

  return smoothstep(linear);
}

export function computeHeroScrollModel({
  trackTop,
  trackHeight,
  viewportHeight,
}: HeroScrollInput): HeroScrollModel {
  const scrollableDistance = trackHeight - viewportHeight;
  const progress =
    scrollableDistance <= 0 ? 0 : clampProgress(-trackTop / scrollableDistance);
  const morphProgress = mapToMorphProgress(progress);

  // The wipe line descends as the dark layer reveals; the menu restyles
  // while that line crosses the nav band, then settles dark.
  const wipeLineY = viewportHeight * (1 - morphProgress);
  const trackBottom = trackTop + trackHeight;

  let navProgress = 0;
  if (wipeLineY <= 0) {
    navProgress = 1;
  } else if (wipeLineY < NAV_HEIGHT_PX) {
    navProgress = smoothstep(1 - wipeLineY / NAV_HEIGHT_PX);
  }

  if (trackBottom <= 0) {
    navProgress = 0;
  } else if (trackBottom < NAV_HEIGHT_PX) {
    navProgress *= smoothstep(trackBottom / NAV_HEIGHT_PX);
  }

  // The menu goes transparent while a dark edge slides through the nav
  // band, so the edge reads as passing through the bar. The old site only
  // did this for the entry wipe; the exit (the track's bottom leaving the
  // viewport) faded through greys that matched neither surface —
  // user-ratified fix: both crossings hand off transparently.
  const isEntryCrossing =
    morphProgress < 1 &&
    wipeLineY <= NAV_HEIGHT_PX &&
    trackBottom > NAV_HEIGHT_PX;
  const isExitCrossing =
    navProgress > 0 && trackBottom <= NAV_HEIGHT_PX && trackBottom > 0;
  const isCrossing = isEntryCrossing || isExitCrossing;

  const menuBackground = isCrossing
    ? MENU_WIPE.transparent
    : MENU_WIPE.backgroundAt(navProgress);

  const stackSpreadProgress = clampProgress((morphProgress - 0.66) / 0.27);
  const selectorRevealProgress = clampProgress((morphProgress - 0.94) / 0.06);

  return {
    aiPanelProgress: clampProgress((morphProgress - 0.45) / 0.25),
    aiPlaybackEnabled: morphProgress >= 0.7,
    aiPointerEventsEnabled: morphProgress > 0.5,
    heroAtStart: morphProgress <= 0,
    introCursorsActive: morphProgress < 0.5,
    isCrossing,
    menuBackground,
    menuElevated: navProgress < 0.02 && !isCrossing,
    menuDark: navProgress >= 0.5,
    morphProgress,
    navProgress,
    selectorRevealProgress,
    selectorRevealReady: selectorRevealProgress > 0.96,
    stackAppearProgress: clampProgress((morphProgress - 0.4) / 0.16),
    stackAlignProgress: clampProgress((morphProgress - 0.62) / 0.04),
    stackSpreadEasedProgress: 1 - Math.pow(1 - stackSpreadProgress, 2.6),
    stackSpreadProgress,
  };
}
