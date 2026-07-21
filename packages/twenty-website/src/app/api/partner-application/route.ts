import { buildLogicFunctionPayload } from '@/partner-application/build-logic-function-payload';
import { partnerApplicationRequestSchema } from '@/partner-application/partner-application-request-schema';
import { createWebhookForwardingRoute } from '@/platform/http';

export const POST = createWebhookForwardingRoute({
  webhookUrlEnvVar: 'PARTNER_APPLICATION_WEBHOOK_URL',
  secretEnvVar: 'PARTNER_APPLICATION_SECRET',
  schema: partnerApplicationRequestSchema,
  buildPayload: buildLogicFunctionPayload,
  logTag: 'partner-application',
  notConfiguredMessage: 'Partner application endpoint is not configured.',
  failureMessage: 'Partner application could not be submitted.',
});
