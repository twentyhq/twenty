export const createTurnUsageRecorder = <TStep>({
  recordTurn,
}: {
  recordTurn: ({
    steps,
    userCreditsUsedMicro,
  }: {
    steps: TStep[];
    userCreditsUsedMicro: number;
  }) => Promise<void>;
}): {
  trackStepDebit: <TStepDebitResult extends { userCreditsUsedMicro: number }>(
    step: TStep,
    debitPromise: Promise<TStepDebitResult>,
  ) => Promise<TStepDebitResult>;
  recordOnce: () => Promise<void>;
} => {
  const debitedSteps: TStep[] = [];
  const pendingStepDebits: Promise<unknown>[] = [];
  let userCreditsUsedMicro = 0;
  let isRecorded = false;

  return {
    trackStepDebit: (step, debitPromise) => {
      const accumulatedDebitPromise = debitPromise.then((stepDebitResult) => {
        userCreditsUsedMicro += stepDebitResult.userCreditsUsedMicro;

        return stepDebitResult;
      });

      debitedSteps.push(step);
      pendingStepDebits.push(accumulatedDebitPromise);

      return accumulatedDebitPromise;
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

      await recordTurn({ steps: [...debitedSteps], userCreditsUsedMicro });
    },
  };
};
