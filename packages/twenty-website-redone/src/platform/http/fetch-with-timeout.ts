// fetch with a hard timeout via AbortController, returning a result union
// instead of throwing so callers branch on 'timeout' vs 'network' explicitly.
type FetchWithTimeoutResult =
  | { ok: true; response: Response }
  | { ok: false; error: 'timeout' | 'network' };

export async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  options: { timeoutMs: number },
): Promise<FetchWithTimeoutResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeoutMs);

  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    return { ok: true, response };
  } catch (error) {
    if (
      error instanceof Error &&
      (error.name === 'AbortError' || error.name === 'TimeoutError')
    ) {
      return { ok: false, error: 'timeout' };
    }
    return { ok: false, error: 'network' };
  } finally {
    clearTimeout(timer);
  }
}
