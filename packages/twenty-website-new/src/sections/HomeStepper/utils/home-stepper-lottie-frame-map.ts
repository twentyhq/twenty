const STEP_1_GOOD_FRACTION = 4 / 5;

const STEP_2_GOOD_FRACTION = 4 / 5;

const STEP_COUNT = 3;

const STEP_3_INDEX = 2;

// Fallback when JSON metadata is not available yet (matches current home stepper asset)
export const HOME_STEPPER_LOTTIE_DEFAULT_TOTAL_FRAMES = 1499;

// While local scroll progress is below this, the left column stays visually fixed (Lottie-only scroll).
// Matches the main portion of each step in the Lottie map; the remainder is the step-to-step transition.
export const HOME_STEPPER_LEFT_HOLD_LOCAL_PROGRESS_MAX = STEP_1_GOOD_FRACTION;

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

function homeStepperStepFrameRanges(
  totalFrames: number,
): readonly [number, number][] {
  const lastFrameIndex = Math.max(0, totalFrames - 1);
  const third = totalFrames / STEP_COUNT;

  const step1End = third * STEP_1_GOOD_FRACTION - 1;
  const step2Start = third;
  const step2End = third + third * STEP_2_GOOD_FRACTION - 1;
  const step3Start = step2End + 1;

  return [
    [0, step1End],
    [step2Start, step2End],
    [step3Start, lastFrameIndex],
  ] as const;
}

export function scrollProgressToHomeStepperLottieFrame(
  scrollProgress: number,
  totalFrames: number,
): number {
  const rounded = Math.round(totalFrames);
  const safeTotal =
    Number.isFinite(rounded) && rounded >= STEP_COUNT
      ? rounded
      : HOME_STEPPER_LOTTIE_DEFAULT_TOTAL_FRAMES;
  const lastIndex = safeTotal - 1;
  const stepFrameRanges = homeStepperStepFrameRanges(safeTotal);

  const clamped = clampUnit(scrollProgress);
  const stepFloat = clamped * STEP_COUNT;
  const stepIndex = Math.min(STEP_COUNT - 1, Math.floor(stepFloat));
  const localProgress = stepFloat - stepIndex;

  const [rangeStart, rangeEnd] = stepFrameRanges[stepIndex];
  const clampedEnd = Math.min(rangeEnd, lastIndex);
  const clampedStart = Math.min(rangeStart, clampedEnd);

  let frame: number;
  if (stepIndex === STEP_3_INDEX) {
    frame = step3LocalProgressToFrame(
      localProgress,
      clampedStart,
      clampedEnd,
    );
  } else {
    const frameProgress = easeInOutCubic(localProgress);
    frame =
      clampedStart + frameProgress * (clampedEnd - clampedStart);
  }

  return Math.max(0, Math.min(lastIndex, frame));
}
