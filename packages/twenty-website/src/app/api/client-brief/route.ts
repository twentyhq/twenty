import { buildClientBriefPayload } from '@/client-brief/build-client-brief-payload';
import { clientBriefRequestSchema } from '@/client-brief/client-brief-request-schema';
import { createWebhookForwardingRoute } from '@/platform/http';

export const POST = createWebhookForwardingRoute({
  webhookUrlEnvVar: 'CLIENT_BRIEF_WEBHOOK_URL',
  secretEnvVar: 'CLIENT_BRIEF_SECRET',
  schema: clientBriefRequestSchema,
  buildPayload: buildClientBriefPayload,
  logTag: 'client-brief',
  notConfiguredMessage: 'Client brief endpoint is not configured.',
  failureMessage: 'Client brief could not be submitted.',
});
