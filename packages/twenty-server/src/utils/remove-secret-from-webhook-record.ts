export const removeSecretFromWebhookRecord = (
  record: Record<string, any> | undefined,
  isWebhookEvent: boolean,
): Record<string, any> | undefined => {
  if (!isWebhookEvent || !record || !record?.secret) return record;

  const { secret: _secret, ...sanitizedRecord } = record;

  return sanitizedRecord;
};
