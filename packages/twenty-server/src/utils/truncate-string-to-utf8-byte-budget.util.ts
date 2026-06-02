// UTF-8 byte-aware string truncation, intended for any payload that ends
// up serialized into a sized storage layer (JSONB columns, logs, etc.).
//
// Why this exists: JavaScript strings are UTF-16, so `String.prototype.
// length` and `String.prototype.slice` count UTF-16 code units (1 per BMP
// character, 2 for surrogate pairs). UTF-8 — what we actually write to
// disk and to the wire — uses 1 to 4 bytes per character. A naive
// `value.slice(0, maxBytes)` over CJK content can emit ~3× the intended
// bytes; emoji content can emit ~2×. For per-step log budgets (and the
// 256 KB outer cap in `WorkflowRunStepLogWorkspaceService.setStepLog`)
// that asymmetry leads to truncated payloads silently overflowing.

export const TRUNCATION_SENTINEL = '…[truncated]';

export type Utf8TruncationResult = {
  // The possibly-truncated string. When `truncated` is `true`, ends with
  // `TRUNCATION_SENTINEL`. The final byte length may exceed `maxBytes` by
  // up to `byteLength(TRUNCATION_SENTINEL)` + 3 bytes (the latter accounts
  // for a single U+FFFD that Node's UTF-8 decoder substitutes when the
  // byte boundary falls inside a multi-byte sequence).
  value: string;
  // UTF-8 byte length of the *original* input (not of `value`).
  originalBytes: number;
  // Whether truncation actually occurred.
  truncated: boolean;
};

export const utf8ByteLengthOf = (value: string): number =>
  Buffer.byteLength(value, 'utf8');

export const truncateStringToUtf8ByteBudget = (
  value: string,
  maxBytes: number,
): Utf8TruncationResult => {
  const originalBytes = utf8ByteLengthOf(value);

  if (originalBytes <= maxBytes) {
    return { value, originalBytes, truncated: false };
  }

  // Round-trip through a Buffer so the cut happens at byte boundaries. If
  // `maxBytes` lands inside a multi-byte sequence, V8 emits a U+FFFD
  // replacement char (3 bytes in UTF-8) for the partial bytes.
  const truncated = Buffer.from(value, 'utf8')
    .subarray(0, maxBytes)
    .toString('utf8');

  return {
    value: `${truncated}${TRUNCATION_SENTINEL}`,
    originalBytes,
    truncated: true,
  };
};
