import crypto from 'crypto';

const GENERATION_CREATED_AT_SEPARATOR = '.';

export const createWorkspaceCacheGeneration = (now: number = Date.now()) =>
  `${crypto.randomUUID()}${GENERATION_CREATED_AT_SEPARATOR}${now}`;

export const isWorkspaceCacheGenerationExpired = ({
  generation,
  maxAgeMs,
  now = Date.now(),
}: {
  generation: string;
  maxAgeMs: number;
  now?: number;
}): boolean => {
  const separatorIndex = generation.lastIndexOf(
    GENERATION_CREATED_AT_SEPARATOR,
  );

  if (separatorIndex === -1) {
    return true;
  }

  const createdAt = Number(generation.slice(separatorIndex + 1));

  if (!Number.isSafeInteger(createdAt)) {
    return true;
  }

  return Math.abs(now - createdAt) > maxAgeMs;
};
