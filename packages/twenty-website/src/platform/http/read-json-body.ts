// Reads and parses a JSON request body with guards an API route needs before
// trusting input: it must be application/json, within a byte cap (checked
// against the declared length and the actual bytes), and valid JSON. Returns a
// result union so the route maps each failure to its own status.
type ReadJsonBodyResult<TValue> =
  | { ok: true; value: TValue }
  | { ok: false; error: 'invalid-json' | 'too-large' | 'wrong-content-type' };

function isJsonContentType(contentType: string): boolean {
  const base = contentType.toLowerCase().split(';')[0]?.trim() ?? '';
  return base === 'application/json' || base.endsWith('+json');
}

export async function readJsonBody<TValue = unknown>(
  request: Request,
  options: { maxBytes: number },
): Promise<ReadJsonBodyResult<TValue>> {
  const contentType = request.headers.get('content-type') ?? '';
  if (!isJsonContentType(contentType)) {
    return { ok: false, error: 'wrong-content-type' };
  }

  const declaredLength = request.headers.get('content-length');
  if (declaredLength !== null) {
    const length = Number.parseInt(declaredLength, 10);
    if (Number.isFinite(length) && length > options.maxBytes) {
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

  return { ok: true, value: value as TValue };
}
