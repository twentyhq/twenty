import { Module } from '@nestjs/common';

import { AuditModule } from 'src/engine/core-modules/audit/audit.module';
import { MetricsModule } from 'src/engine/core-modules/metrics/metrics.module';
import { SecureHttpClientModule } from 'src/engine/core-modules/secure-http-client/secure-http-client.module';
import { FlatWebhookModule } from 'src/engine/metadata-modules/flat-webhook/flat-webhook.module';
import { CallWebhookJobsForMetadataJob } from 'src/engine/metadata-modules/webhook/jobs/call-webhook-jobs-for-metadata.job';
import { CallWebhookJobsJob } from 'src/engine/metadata-modules/webhook/jobs/call-webhook-jobs.job';
import { CallWebhookJob } from 'src/engine/metadata-modules/webhook/jobs/call-webhook.job';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    AuditModule,
    FlatWebhookModule,
    MetricsModule,
    SecureHttpClientModule,
    WorkspaceCacheModule,
  ],
  providers: [
    CallWebhookJobsJob,
    CallWebhookJobsForMetadataJob,
    CallWebhookJob,
  ],
})
export class WebhookJobModule {}
