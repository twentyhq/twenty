export const createTurnUsageRecorder = <TStep>({
  recordTurn,
}: {
  recordTurn: ({
    steps,
    memberCreditsUsedMicro,
  }: {
    steps: TStep[];
    memberCreditsUsedMicro: number;
  }) => Promise<void>;
}): {
  trackStepDebit: <TStepDebitResult extends { memberCreditsUsedMicro: number }>(
    step: TStep,
    debitPromise: Promise<TStepDebitResult>,
  ) => Promise<TStepDebitResult>;
  recordOnce: () => Promise<void>;
} => {
  const debitedSteps: TStep[] = [];
  const pendingStepDebits: Promise<unknown>[] = [];
  let memberCreditsUsedMicro = 0;
  let isRecorded = false;

  return {
    trackStepDebit: (step, debitPromise) => {
      const accumulatedDebitPromise = debitPromise.then((stepDebitResult) => {
        memberCreditsUsedMicro += stepDebitResult.memberCreditsUsedMicro;

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

      await recordTurn({ steps: [...debitedSteps], memberCreditsUsedMicro });
    },
  };
};
