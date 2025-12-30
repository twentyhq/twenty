import * as crypto from 'node:crypto';

export const validateWebhookPayload = (
  sha256_signature: string | null,
  payload: string,
  app_secret: string,
): boolean => {
  const webhookSignature = sha256_signature?.replace('sha256=', '').trim(); // https://developers.facebook.com/docs/graph-api/webhooks/getting-started#validate-payloads
  const generatedHash = crypto
    .createHmac('sha256', app_secret)
    .update(payload)
    .digest('hex');

  return webhookSignature === generatedHash;
};
