const STEP_COUNT = 3;
const STEP_1_TRANSITION_END = 285;
const STEP_2_TRANSITION_END = 925;

export const LOTTIE_FRAME_MAP: {
  expectedTotalFrames: number;
  toFrame: (scrollProgress: number, totalFrames: number) => number;
} = {
  expectedTotalFrames: 1439,
  toFrame: (scrollProgress, totalFrames) => {
    const lastIndex = Math.max(0, totalFrames - 1);
    const clamped = Math.max(0, Math.min(1, scrollProgress));
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
  },
};
