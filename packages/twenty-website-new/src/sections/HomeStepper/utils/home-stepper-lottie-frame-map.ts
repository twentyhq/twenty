const STEP_COUNT = 3;

function clampUnit(value: number): number {
  return Math.max(0, Math.min(1, value));
}

// Lottie timeline (frames): step 1 hold ends → transition ends → step 2 hold ends → transition ends → step 3.
const STEP_1_HOLD_END = 240;
const STEP_1_TRANSITION_END = 285;
const STEP_2_HOLD_END = 880;
const STEP_2_TRANSITION_END = 925;

// Total frame count of the `.lottie` asset this map was authored against.
// The dotlottie player exposes `totalFrames` as `Math.round(op - ip)`; the
// Lottielab export at `public/lottie/stepper/stepper.lottie` has `ip = 0`
// and `op = 1439.4`, so the integer count is 1439. Both a runtime assert
// (in `StepperLottie`) and a build-time script
// (`scripts/check-lottie-frames.mjs`, wired into `nx lint`) verify this
// number stays in sync with the asset — a designer re-export with a
// different timeline would silently break the scroll mapping otherwise.
//
// IMPORTANT: the build-time script parses this file with a regex; keep
// the `export const HOME_STEPPER_LOTTIE_EXPECTED_TOTAL_FRAMES = <number>`
// line shape stable, or update the script in lockstep.
export const HOME_STEPPER_LOTTIE_EXPECTED_TOTAL_FRAMES = 1439;

// Fraction of each scroll third spent in “hold” before UI / Lottie moves to the next step (see LeftColumn).
export const HOME_STEPPER_HOLD_FRACTIONS = [
  STEP_1_HOLD_END / STEP_1_TRANSITION_END,
  (STEP_2_HOLD_END - STEP_1_TRANSITION_END) /
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
