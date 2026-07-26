import { z } from 'zod';

const MAX_REDIRECT_URL_LENGTH = 2048;

const redirectUrlCandidateSchema = z
  .string()
  .trim()
  .min(1)
  .max(MAX_REDIRECT_URL_LENGTH);

// Resolves a caller-supplied redirect target against the website origin and
// rejects anything that escapes it. String concatenation is unsafe here:
// `${origin}${candidate}` turns ".evil.com" or "@evil.com" into a URL pointing
// at an attacker host, so resolution has to go through the URL parser.
export const resolveSameOriginUrl = (
  candidate: unknown,
  baseUrl: string,
): string | null => {
  const parsedCandidate = redirectUrlCandidateSchema.safeParse(candidate);

  if (!parsedCandidate.success) {
    return null;
  }

  try {
    const base = new URL(baseUrl);
    const resolved = new URL(parsedCandidate.data, base);

    if (resolved.origin !== base.origin) {
      return null;
    }

    return resolved.toString();
  } catch {
    return null;
  }
};
