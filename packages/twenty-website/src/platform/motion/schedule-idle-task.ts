// Defers low-priority work (chunk preloads) to browser idle time, with a
// timeout fallback so it always runs (the old mount scheduler's one job).
export function scheduleIdleTask(
  task: () => void,
  options: { timeoutMs: number } = { timeoutMs: 900 },
): () => void {
  if (typeof requestIdleCallback === 'function') {
    const handle = requestIdleCallback(() => task(), {
      timeout: options.timeoutMs,
    });
    return () => cancelIdleCallback(handle);
  }
  const handle = setTimeout(task, options.timeoutMs);
  return () => clearTimeout(handle);
}
