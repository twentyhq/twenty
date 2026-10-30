import { affiliateApplicationRequestSchema } from '@/affiliate-application/affiliate-application-request-schema';
import { buildAffiliateWorkflowPayload } from '@/affiliate-application/build-affiliate-workflow-payload';
import { createWebhookForwardingRoute } from '@/platform/http';

export const POST = createWebhookForwardingRoute({
  webhookUrlEnvVar: 'AFFILIATE_APPLICATION_WEBHOOK_URL',
  secretEnvVar: 'AFFILIATE_APPLICATION_SECRET',
  upstreamKind: 'workflow-webhook',
  schema: affiliateApplicationRequestSchema,
  buildPayload: buildAffiliateWorkflowPayload,
  logTag: 'affiliate-application',
  notConfiguredMessage: 'Affiliate application endpoint is not configured.',
  failureMessage: 'Affiliate application could not be submitted.',
});
