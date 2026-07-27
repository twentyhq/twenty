import { partnerSlugSchema } from './client-brief-request-schema';

// The API schema is strict: a malformed value must be dropped here, not
// forwarded, or it fails the whole brief submission.
export function normalizePartnerSlug(
  raw: string | string[] | undefined,
): string | undefined {
  return partnerSlugSchema.safeParse(Array.isArray(raw) ? raw[0] : raw).data;
}
