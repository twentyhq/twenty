export const SETUP_STEP_DURATIONS: { step: string; milliseconds: number }[] =
  [];

export const measureSetupStep = async <TResult>({
  step,
  run,
}: {
  step: string;
  run: () => Promise<TResult>;
}): Promise<TResult> => {
  const startedAt = Date.now();
  const result = await run();

  SETUP_STEP_DURATIONS.push({ step, milliseconds: Date.now() - startedAt });

  return result;
};
