type ReadJsonBodyResult<T> =
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
  const lower = contentType.toLowerCase().split(';')[0]?.trim() ?? '';
  return lower === 'application/json' || lower.endsWith('+json');
}
