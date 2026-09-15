import { clampProgress } from '@/platform/motion';

export type CardRevealFrame = {
  opacity: number;
  scale: number;
  translateYPx: number;
};

// The authored choreography, verbatim: cards rise 200px into place at
// 0.88→1 scale, each a quarter-progress behind the previous, fading in
// over the first 40% of its own travel.
const END_EDGE_RATIO = 0.2;
const INITIAL_SCALE = 0.88;
const INITIAL_TRANSLATE_Y_PX = 200;
const OPACITY_RAMP = 0.4;
const STAGGER = 0.25;

const easeOutQuint = (value: number) => 1 - (1 - value) ** 5;

export const cardReveal = {
  // Progress runs while the grid's top edge travels from the viewport
  // bottom to 20% of the viewport height.
  progressForGridTop(gridTopPx: number, viewportHeightPx: number): number {
    const startEdge = viewportHeightPx;
    const endEdge = viewportHeightPx * END_EDGE_RATIO;
    return clampProgress((startEdge - gridTopPx) / (startEdge - endEdge));
  },

  frameAt(progress: number, cardIndex: number): CardRevealFrame {
    const delay = cardIndex * STAGGER;
    const localProgress = clampProgress(
      (progress - delay) / Math.max(1 - delay, Number.EPSILON),
    );
    const eased = easeOutQuint(localProgress);

    return {
      opacity: clampProgress(localProgress / OPACITY_RAMP),
      scale: INITIAL_SCALE + eased * (1 - INITIAL_SCALE),
      translateYPx: (1 - eased) * INITIAL_TRANSLATE_Y_PX,
    };
  },
};
