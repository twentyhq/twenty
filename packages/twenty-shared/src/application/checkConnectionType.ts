import { type ApplicationHealthCheckResult } from '@/application/applicationHealthType';

export type CheckConnectionPayload = {
  connectionProviderId: string;
  connectionProviderName: string;
  connectedAccountId: string;
};

// Same shape as an app health check, so both render through the same banner.
export type CheckConnectionResult = ApplicationHealthCheckResult;
