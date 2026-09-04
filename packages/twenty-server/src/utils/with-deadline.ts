export const withDeadline = async <TResult>({
  promise,
  timeoutMs,
  createTimeoutError,
}: {
  promise: Promise<TResult>;
  timeoutMs: number;
  createTimeoutError: () => Error;
}): Promise<TResult> => {
  let timeoutId: NodeJS.Timeout | undefined;

  const deadline = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(createTimeoutError()), timeoutMs);
  });

  try {
    return await Promise.race([promise, deadline]);
  } finally {
    clearTimeout(timeoutId);
  }
};
