/**
 * `readJsonBody`
 *
 * Reads a JSON request body with three guards a raw `request.json()` call
 * does not give you:
 *
 *   1. Content-Type is `application/json` (or a parameterised variant).
 *      Otherwise a hostile client can submit form-encoded data that we'd
 *      then mis-parse.
 *   2. Content-Length, if declared, is within `maxBytes`. This rejects
 *      oversize requests *before* we allocate a buffer to hold the body.
 *   3. Actual byte length is within `maxBytes` (Content-Length can lie or
 *      be absent on chunked transfers).
 *
 * Returns a discriminated result so route handlers can map errors directly
 * onto HTTP status codes:
 *   - `wrong-content-type` → 415
 *   - `too-large`          → 413
 *   - `invalid-json`       → 400
 *
 * `maxBytes` is intentionally required — picking a per-route cap is a
 * deliberate decision (the partner application form, for example, has no
 * legitimate reason to send more than ~2 KB).
 *
 * Outer platform limits (e.g. Vercel's 4.5 MB function payload limit) still
 * apply on top of this; this helper protects the application logic, not the
 * transport.
 */

export type ReadJsonBodyResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: 'invalid-json' | 'too-large' | 'wrong-content-type' };

export async function readJsonBody<T = unknown>(
  request: Request,
  options: { maxBytes: number },
): Promise<ReadJsonBodyResult<T>> {
  const contentType = request.headers.get('content-type') ?? '';
  if (!isJsonContentType(contentType)) {
    return { ok: false, error: 'wrong-content-type' };
  }

  const declared = request.headers.get('content-length');
  if (declared !== null) {
    const len = Number.parseInt(declared, 10);
    if (Number.isFinite(len) && len > options.maxBytes) {
      return { ok: false, error: 'too-large' };
    }
  }

  let buffer: ArrayBuffer;
  try {
    buffer = await request.arrayBuffer();
  } catch {
    return { ok: false, error: 'invalid-json' };
  }

  if (buffer.byteLength > options.maxBytes) {
    return { ok: false, error: 'too-large' };
  }

  let value: unknown;
  try {
    value = JSON.parse(new TextDecoder().decode(buffer));
  } catch {
    return { ok: false, error: 'invalid-json' };
  }

  return { ok: true, value: value as T };
}

function isJsonContentType(contentType: string): boolean {
  // `application/json`, `application/json; charset=utf-8`,
  // `application/vnd.api+json`, etc.
  const lower = contentType.toLowerCase().split(';')[0]?.trim() ?? '';
  return lower === 'application/json' || lower.endsWith('+json');
}
