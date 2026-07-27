const PARTNER_SLUG_PATTERN = /^[a-z0-9-]{1,100}$/;

// The API schema is strict, so a malformed value must be dropped here rather
// than forwarded and rejected — that would fail the whole brief submission.
export function normalizePartnerSlug(
  raw: string | string[] | undefined,
): string | undefined {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  return PARTNER_SLUG_PATTERN.test(trimmed) ? trimmed : undefined;
}
