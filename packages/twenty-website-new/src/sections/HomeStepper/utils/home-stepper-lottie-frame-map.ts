const STEP_COUNT = 3;

function clampUnit(value: number): number {
  return Math.max(0, Math.min(1, value));
}

const STEP_1_TRANSITION_END = 415;
const STEP_2_TRANSITION_END = 1045;

export const HOME_STEPPER_HOLD_FRACTIONS = [
  345 / STEP_1_TRANSITION_END,
  (933 - STEP_1_TRANSITION_END) /
    (STEP_2_TRANSITION_END - STEP_1_TRANSITION_END),
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
    stepIndex === 0
      ? 0
      : stepIndex === 1
        ? STEP_1_TRANSITION_END
        : STEP_2_TRANSITION_END;
  const rangeEnd =
    stepIndex === 0
      ? STEP_1_TRANSITION_END
      : stepIndex === 1
        ? STEP_2_TRANSITION_END
        : lastIndex;

  const frame = rangeStart + localProgress * (rangeEnd - rangeStart);

  return Math.max(0, Math.min(lastIndex, frame));
}
