type ContextBudgetLike = {
  getActiveCount: () => number;
  getPendingCount: () => number;
  getMaxActive: () => number;
};

type VisualTestInstrumentation = {
  registerContextBudget: (budget: ContextBudgetLike) => void;
  countFrameTick: () => void;
};

declare global {
  // Window augmentation requires declaration merging — the codebase-wide
  // types-over-interfaces rule explicitly excepts third-party extension.
  // eslint-disable-next-line typescript-eslint/consistent-type-definitions
  interface Window {
    __visualRuntimeTest?: {
      getActiveContextCount: () => number;
      getPendingContextCount: () => number;
      getContextCap: () => number;
      getRafTicks: () => number;
    };
  }
}

// Dev-only probes the Playwright batteries read (context counts, frame
// ticks). In production every method is a no-op and nothing attaches to
// window.
function createVisualTestInstrumentation(): VisualTestInstrumentation {
  if (process.env.NODE_ENV === 'production' || typeof window === 'undefined') {
    return {
      registerContextBudget: () => {},
      countFrameTick: () => {},
    };
  }

  let rafTicks = 0;
  let budget: ContextBudgetLike | null = null;

  window.__visualRuntimeTest = {
    getActiveContextCount: () => budget?.getActiveCount() ?? 0,
    getPendingContextCount: () => budget?.getPendingCount() ?? 0,
    getContextCap: () => budget?.getMaxActive() ?? 0,
    getRafTicks: () => rafTicks,
  };

  return {
    registerContextBudget: (contextBudget) => {
      budget = contextBudget;
    },
    countFrameTick: () => {
      rafTicks += 1;
    },
  };
}

export const visualTestInstrumentation = createVisualTestInstrumentation();
