export const createTurnUsageRecorder = <TStep>({
  recordTurn,
}: {
  recordTurn: ({ steps }: { steps: TStep[] }) => Promise<void>;
}): {
  trackStepDebit: <TStepDebitResult>(
    step: TStep,
    debitPromise: Promise<TStepDebitResult>,
  ) => Promise<TStepDebitResult>;
  recordOnce: () => Promise<void>;
} => {
  const debitedSteps: TStep[] = [];
  const pendingStepDebits: Promise<unknown>[] = [];
  let isRecorded = false;

  return {
    trackStepDebit: (step, debitPromise) => {
      debitedSteps.push(step);
      pendingStepDebits.push(debitPromise);

      return debitPromise;
    },
    recordOnce: async () => {
      if (isRecorded) {
        return;
      }

      isRecorded = true;

      await Promise.allSettled(pendingStepDebits);

      if (debitedSteps.length === 0) {
        return;
      }

      await recordTurn({ steps: [...debitedSteps] });
    },
  };
};
