/**
 * `lib/api` — server-only primitives for Next.js route handlers.
 *
 * What lives here:
 *   - `fetchWithTimeout` — outbound calls with a hard timeout
 *   - `readJsonBody`     — JSON body parsing with size + content-type guards
 *   - `createRateLimiter`/`getClientIpKey` — best-effort in-memory rate limit
 *
 * Everything in this folder runs only on the server. Importing from a
 * client component is fine for the *types* but the runtime code assumes a
 * Node-shaped global `fetch`, `Request`, `Headers`, and `setTimeout` and
 * keeps process-wide module state. Don't bundle into the browser.
 *
 * Scope of this module is intentionally narrow: route handlers should keep
 * business logic in their own file and lean on these primitives only for
 * cross-cutting concerns. See ARCHITECTURE.md → API surface.
 */

export { fetchWithTimeout } from './fetch-with-timeout';
export type { FetchWithTimeoutResult } from './fetch-with-timeout';

export { readJsonBody } from './read-json-body';
export type { ReadJsonBodyResult } from './read-json-body';

export { createRateLimiter, getClientIpKey } from './rate-limit';
export type { RateLimitOptions, RateLimitResult } from './rate-limit';
