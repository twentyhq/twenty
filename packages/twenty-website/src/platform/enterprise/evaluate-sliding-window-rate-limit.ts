import { isDefined } from 'twenty-shared/utils';

export type RateLimitDecision =
  | { allowed: true; metadataPatch: Record<string, string> }
  | { allowed: false; retryAfter: Date };

const parseRecentTimestamps = (
  raw: string | undefined,
  now: Date,
  windowMs: number,
): number[] => {
  if (!isDefined(raw) || raw.length === 0) {
    return [];
  }

  const nowMs = now.getTime();
  const cutoffMs = nowMs - windowMs;

  return raw
    .split(',')
    .map((entry) => Number.parseInt(entry, 10))
    .filter(
      (timestampMs) =>
        !Number.isNaN(timestampMs) &&
        timestampMs > cutoffMs &&
        timestampMs <= nowMs,
    )
    .toSorted((a, b) => a - b);
};

export const evaluateSlidingWindowRateLimit = ({
  raw,
  metadataKey,
  limit,
  windowMs,
  now,
}: {
  raw: string | undefined;
  metadataKey: string;
  limit: number;
  windowMs: number;
  now: Date;
}): RateLimitDecision => {
  const recentTimestamps = parseRecentTimestamps(raw, now, windowMs);

  if (recentTimestamps.length >= limit) {
    const oldestTimestampMs = recentTimestamps[0];

    return {
      allowed: false,
      retryAfter: new Date(oldestTimestampMs + windowMs),
    };
  }

  const updatedTimestamps = [...recentTimestamps, now.getTime()];

  return {
    allowed: true,
    metadataPatch: {
      [metadataKey]: updatedTimestamps.join(','),
    },
  };
};
