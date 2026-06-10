import {
  TRUNCATION_SENTINEL,
  truncateStringToUtf8ByteBudget,
  utf8ByteLengthOf,
} from 'src/utils/truncate-string-to-utf8-byte-budget.util';

describe('utf8ByteLengthOf', () => {
  it('returns the UTF-8 byte length, not the UTF-16 code unit count', () => {
    expect(utf8ByteLengthOf('a')).toBe(1);
    expect(utf8ByteLengthOf('é')).toBe(2);
    expect(utf8ByteLengthOf('日')).toBe(3);
    expect(utf8ByteLengthOf('😀')).toBe(4);
  });
});

describe('truncateStringToUtf8ByteBudget', () => {
  it('returns the input unchanged when under the byte budget', () => {
    const result = truncateStringToUtf8ByteBudget('hello', 100);

    expect(result).toEqual({
      value: 'hello',
      originalBytes: 5,
      truncated: false,
    });
  });

  it('returns the input unchanged exactly at the byte budget', () => {
    const result = truncateStringToUtf8ByteBudget('hello', 5);

    expect(result.truncated).toBe(false);
    expect(result.value).toBe('hello');
  });

  it('truncates ASCII content and appends the sentinel', () => {
    const result = truncateStringToUtf8ByteBudget('x'.repeat(100), 10);

    expect(result.truncated).toBe(true);
    expect(result.originalBytes).toBe(100);
    expect(result.value).toBe(`${'x'.repeat(10)}${TRUNCATION_SENTINEL}`);
  });

  it('reports originalBytes in UTF-8 bytes for non-ASCII content', () => {
    // 1 × '日' = 3 UTF-8 bytes but only 1 UTF-16 code unit.
    const result = truncateStringToUtf8ByteBudget('日'.repeat(1_000), 30);

    expect(result.originalBytes).toBe(3_000);
    expect(result.truncated).toBe(true);
  });

  it('truncates CJK content within budget rather than 3× over (regression)', () => {
    // Pre-fix `slice(0, maxBytes)` would have emitted 32_000 chars =
    // ~96_000 bytes. The byte-aware util must stay close to the cap.
    const cjk = '日'.repeat(40_000);
    const cap = 32_000;

    const result = truncateStringToUtf8ByteBudget(cjk, cap);

    const truncatedPayloadBytes = utf8ByteLengthOf(
      result.value.replace(TRUNCATION_SENTINEL, ''),
    );

    // Allow at most a single U+FFFD substitution (3 UTF-8 bytes) when the
    // byte boundary falls inside a multi-byte sequence.
    expect(truncatedPayloadBytes).toBeLessThanOrEqual(cap + 3);
    expect(truncatedPayloadBytes).toBeGreaterThan(cap - 3);
  });

  it('handles emoji (surrogate pair, 4 UTF-8 bytes) without exceeding the budget', () => {
    const emoji = '😀'.repeat(10_000);
    const cap = 4_000;

    const result = truncateStringToUtf8ByteBudget(emoji, cap);

    const truncatedPayloadBytes = utf8ByteLengthOf(
      result.value.replace(TRUNCATION_SENTINEL, ''),
    );

    expect(result.originalBytes).toBe(40_000);
    expect(result.truncated).toBe(true);
    expect(truncatedPayloadBytes).toBeLessThanOrEqual(cap + 3);
  });

  it('returns an empty value when the budget is zero', () => {
    const result = truncateStringToUtf8ByteBudget('hello', 0);

    expect(result.truncated).toBe(true);
    expect(result.value).toBe(TRUNCATION_SENTINEL);
  });
});
