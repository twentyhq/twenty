export type FrameTimer = {
  tick: () => number;
  getElapsed: () => number;
};

export function createFrameTimer(): FrameTimer {
  const startedAt = performance.now();
  let previousTickAt: number | null = null;

  return {
    tick: () => {
      const now = performance.now();
      if (previousTickAt === null) {
        previousTickAt = now;
        return 0;
      }
      const deltaSeconds = (now - previousTickAt) / 1000;
      previousTickAt = now;
      return deltaSeconds;
    },
    getElapsed: () => (performance.now() - startedAt) / 1000,
  };
}
