import { isNonEmptyString } from '@sniptt/guards';

export const normalizeSenderDomain = (
  value: string | null | undefined,
): string | null => {
  const normalizedDomain = (value ?? '').trim().replace(/^@/, '').toLowerCase();

  return isNonEmptyString(normalizedDomain) ? normalizedDomain : null;
};
