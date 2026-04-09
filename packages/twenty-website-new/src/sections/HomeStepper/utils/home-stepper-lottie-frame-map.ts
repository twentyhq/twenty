const STEP_COUNT = 3;

function clampUnit(value: number): number {
  return Math.max(0, Math.min(1, value));
}

// Lottie timeline boundaries (from the animation source):
// Step 1 content: frames 0–345, transition 1→2: frames 346–415
// Step 2 content: frames 416–933, transition 2→3: frames 934–980
// Step 3 content: frames 981–end
const STEP_1_TRANSITION_END = 415;
const STEP_2_TRANSITION_END = 980;

// Per-step hold fraction: how much of each step's scroll drives Lottie-only
// (left column stays fixed); the remainder drives the content transition.
export const HOME_STEPPER_HOLD_FRACTIONS = [
  345 / STEP_1_TRANSITION_END,
  (933 - STEP_1_TRANSITION_END) / (STEP_2_TRANSITION_END - STEP_1_TRANSITION_END),
  1,
] as const;

export function scrollProgressToHomeStepperLottieFrame(
  scrollProgress: number,
  totalFrames: number,
): number {
  const lastIndex = Math.max(0, totalFrames - 1);

  const clamped = clampUnit(scrollProgress);
  const stepFloat = clamped * STEP_COUNT;
  const stepIndex = Math.min(STEP_COUNT - 1, Math.floor(stepFloat));
  const localProgress = stepFloat - stepIndex;

  const rangeStart =
    stepIndex === 0 ? 0 : stepIndex === 1 ? STEP_1_TRANSITION_END : STEP_2_TRANSITION_END;
  const rangeEnd =
    stepIndex === 0 ? STEP_1_TRANSITION_END : stepIndex === 1 ? STEP_2_TRANSITION_END : lastIndex;

  const frame = rangeStart + localProgress * (rangeEnd - rangeStart);

  return Math.max(0, Math.min(lastIndex, frame));
}
