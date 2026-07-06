type ExpectEventuallyOptions = {
  timeoutMs?: number;
  intervalMs?: number;
};

export const expectEventually = async (
  assertion: () => Promise<void> | void,
  { timeoutMs = 10_000, intervalMs = 100 }: ExpectEventuallyOptions = {},
): Promise<void> => {
  const startedAt = Date.now();

  for (;;) {
    try {
      await assertion();

      return;
    } catch (error) {
      if (Date.now() - startedAt > timeoutMs) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
  }
};
