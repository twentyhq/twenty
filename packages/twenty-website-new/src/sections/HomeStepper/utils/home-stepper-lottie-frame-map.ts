const STEP_COUNT = 3;

// Fallback when JSON metadata is not available yet (matches current home stepper asset)
export const HOME_STEPPER_LOTTIE_DEFAULT_TOTAL_FRAMES = 1499;

function clampUnit(value: number): number {
  return Math.max(0, Math.min(1, value));
}

// Lottie timeline boundaries (from the animation source):
// Step 1 content: frames 0–345, transition 1→2: frames 346–415
// Step 2 content: frames 416–933, transition 2→3: frames 934–980
// Step 3 content: frames 981–end
const STEP_1_CONTENT_END = 345;
const STEP_1_TRANSITION_END = 415;
const STEP_2_CONTENT_END = 933;
const STEP_2_TRANSITION_END = 980;

// Per-step hold fraction: how much of each step's scroll drives Lottie-only
// (left column stays fixed); the remainder drives the content transition.
export const HOME_STEPPER_HOLD_FRACTIONS = [
  STEP_1_CONTENT_END / STEP_1_TRANSITION_END,
  (STEP_2_CONTENT_END - STEP_1_TRANSITION_END) /
    (STEP_2_TRANSITION_END - STEP_1_TRANSITION_END),
  1,
] as const;

function homeStepperStepFrameRanges(
  totalFrames: number,
): readonly [number, number][] {
  const lastFrame = Math.max(0, totalFrames - 1);
  const scale = totalFrames / HOME_STEPPER_LOTTIE_DEFAULT_TOTAL_FRAMES;

  const step1End = Math.round(STEP_1_TRANSITION_END * scale);
  const step2End = Math.round(STEP_2_TRANSITION_END * scale);

  return [
    [0, step1End],
    [step1End, step2End],
    [step2End, lastFrame],
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
  const frame = rangeStart + localProgress * (rangeEnd - rangeStart);

  return Math.max(0, Math.min(lastIndex, frame));
}
