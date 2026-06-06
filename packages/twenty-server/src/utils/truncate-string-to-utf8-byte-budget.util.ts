export const TRUNCATION_SENTINEL = '…[truncated]';

export type Utf8TruncationResult = {
  value: string;
  originalBytes: number;
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

  const truncated = Buffer.from(value, 'utf8')
    .subarray(0, maxBytes)
    .toString('utf8');

  return {
    value: `${truncated}${TRUNCATION_SENTINEL}`,
    originalBytes,
    truncated: true,
  };
};
