// A server identifier only counts if it is a non-empty, non-whitespace string.
// Clients can send '' or non-string runtime values, which must not be allowed
// to claim or reuse a key (that would bypass single-server enforcement).
export const normalizeServerId = (value: unknown): string | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();

  return trimmed.length === 0 ? undefined : trimmed;
};
