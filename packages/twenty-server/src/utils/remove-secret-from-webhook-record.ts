export const removeSecretFromWebhookRecord = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  record: Record<string, any> | undefined,
  isWebhookEvent: boolean,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Record<string, any> | undefined => {
  if (!isWebhookEvent || !record) return record;

  const { secret: _secret, ...sanitizedRecord } = record;

  return sanitizedRecord;
};
