import { isNonEmptyString } from '@sniptt/guards';

export const normalizeSenderDomain = (
  senderDomain: string | null | undefined,
): string | null => {
  const normalizedDomain = (senderDomain ?? '')
    .trim()
    .replace(/^@/, '')
    .toLowerCase();

  return isNonEmptyString(normalizedDomain) ? normalizedDomain : null;
};
