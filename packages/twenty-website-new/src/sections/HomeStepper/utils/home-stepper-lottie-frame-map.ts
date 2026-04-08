const ROOT_FRAME_COUNT = 1380;
const THIRD = ROOT_FRAME_COUNT / 3;

const STEP_1_GOOD_FRACTION = 4 / 5;

const STEP_1_FRAME_START = 0;
const STEP_1_FRAME_END = THIRD * STEP_1_GOOD_FRACTION - 1;

const STEP_2_GOOD_FRACTION = 4 / 5;

const STEP_2_FRAME_START = THIRD;
const STEP_2_FRAME_END = THIRD + THIRD * STEP_2_GOOD_FRACTION - 1;

const STEP_3_FRAME_START = STEP_2_FRAME_END + 1;
const STEP_3_FRAME_END = ROOT_FRAME_COUNT - 1;

const STEP_FRAME_RANGES: readonly [number, number][] = [
  [STEP_1_FRAME_START, STEP_1_FRAME_END],
  [STEP_2_FRAME_START, STEP_2_FRAME_END],
  [STEP_3_FRAME_START, STEP_3_FRAME_END],
];

const STEP_COUNT = STEP_FRAME_RANGES.length;

const STEP_3_INDEX = 2;

function clampUnit(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function easeInOutCubic(scrollUnit: number): number {
  const clamped = clampUnit(scrollUnit);
  return clamped < 0.5
    ? 4 * clamped ** 3
    : 1 - (-2 * clamped + 2) ** 3 / 2;
}

const STEP_3_TAIL_SCROLL_FRACTION = 0.42;

const STEP_3_TAIL_FRAME_FRACTION = 0.16;

function easeOutQuint(scrollUnit: number): number {
  const clamped = clampUnit(scrollUnit);
  return 1 - (1 - clamped) ** 5;
}

function step3LocalProgressToFrame(
  localProgress: number,
  rangeStart: number,
  rangeEnd: number,
): number {
  const span = rangeEnd - rangeStart;
  if (span <= 0) {
    return rangeStart;
  }

  const tailScroll = Math.max(0.05, Math.min(0.85, STEP_3_TAIL_SCROLL_FRACTION));
  const tailFrameFraction = Math.max(0.02, Math.min(0.45, STEP_3_TAIL_FRAME_FRACTION));
  const headScroll = 1 - tailScroll;

  const pivot = rangeEnd - span * tailFrameFraction;

  if (localProgress <= headScroll) {
    const headUnit =
      headScroll <= 0 ? 1 : clampUnit(localProgress / headScroll);
    const eased = easeOutQuint(headUnit);
    return rangeStart + eased * (pivot - rangeStart);
  }

  const tailUnit = clampUnit((localProgress - headScroll) / tailScroll);
  const easedTail = easeInOutCubic(tailUnit);
  return pivot + easedTail * (rangeEnd - pivot);
}

export function scrollProgressToHomeStepperLottieFrame(
  scrollProgress: number,
): number {
  const clamped = clampUnit(scrollProgress);
  const stepFloat = clamped * STEP_COUNT;
  const stepIndex = Math.min(STEP_COUNT - 1, Math.floor(stepFloat));
  const localProgress = stepFloat - stepIndex;

  const [rangeStart, rangeEnd] = STEP_FRAME_RANGES[stepIndex];

  if (stepIndex === STEP_3_INDEX) {
    return step3LocalProgressToFrame(localProgress, rangeStart, rangeEnd);
  }

  const frameProgress = easeInOutCubic(localProgress);
  return rangeStart + frameProgress * (rangeEnd - rangeStart);
}
