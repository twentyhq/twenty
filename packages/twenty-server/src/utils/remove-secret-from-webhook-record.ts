export const removeSecretFromWebhookRecord = (
  record: Record<string, unknown> | undefined,
  isWebhookEvent: boolean,
): Record<string, unknown> | undefined => {
  if (!isWebhookEvent || !record) return record;

  const { secret: _secret, ...sanitizedRecord } = record;

  return sanitizedRecord;
};
