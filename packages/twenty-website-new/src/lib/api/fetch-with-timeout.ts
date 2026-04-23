/**
 * `fetchWithTimeout`
 *
 * Thin wrapper around `fetch` that aborts after `timeoutMs`. Returns a
 * discriminated result instead of throwing so route handlers can map cleanly
 * onto HTTP status codes (e.g. `timeout` → 504, `network` → 502).
 *
 * Why this exists: Next.js route handlers run in a serverless environment
 * with a hard execution budget. A slow upstream (a webhook that hangs) will
 * pin the function for its full max-duration, costing money and starving
 * other requests. Every outbound `fetch` from a route handler in this app
 * must use this helper.
 *
 * Caveats:
 * - This helper does not currently compose external `AbortSignal`s. Callers
 *   that need their own cancellation should extend it rather than reach
 *   around it.
 * - The default `timeoutMs` is intentionally absent — picking a timeout is
 *   a per-route decision and should be visible at the call site.
 */

export type FetchWithTimeoutResult =
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
  } catch (err) {
    if (
      err instanceof Error &&
      (err.name === 'AbortError' || err.name === 'TimeoutError')
    ) {
      return { ok: false, error: 'timeout' };
    }
    return { ok: false, error: 'network' };
  } finally {
    clearTimeout(timer);
  }
}
