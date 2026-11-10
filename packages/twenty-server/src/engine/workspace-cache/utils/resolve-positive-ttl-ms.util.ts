const DEFAULT_METADATA_TTL_SECONDS = 3600;

const isPositiveFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value > 0;

export const resolvePositiveTtlMs = (ttlSeconds: unknown): number =>
  (isPositiveFiniteNumber(ttlSeconds)
    ? ttlSeconds
    : DEFAULT_METADATA_TTL_SECONDS) * 1000;

export const resolveMaxAgeBoundedTtlMs = ({
  storageTtlSeconds,
  maxAgeSeconds,
}: {
  storageTtlSeconds: unknown;
  maxAgeSeconds: unknown;
}): number => {
  const maxAgeMs = resolvePositiveTtlMs(maxAgeSeconds);

  if (!isPositiveFiniteNumber(storageTtlSeconds)) {
    return maxAgeMs;
  }

  return Math.min(storageTtlSeconds * 1000, maxAgeMs);
};
