import { Module } from '@nestjs/common';

import { EventLogEmitterModule } from 'src/engine/core-modules/event-logs/emit/event-log-emitter.module';
import { MetricsModule } from 'src/engine/core-modules/metrics/metrics.module';
import { SecureHttpClientModule } from 'src/engine/core-modules/secure-http-client/secure-http-client.module';
import { FlatWebhookModule } from 'src/engine/metadata-modules/flat-webhook/flat-webhook.module';
import { CallWebhookJobsForMetadataJob } from 'src/engine/metadata-modules/webhook/jobs/call-webhook-jobs-for-metadata.job';
import { CallWebhookJobsJob } from 'src/engine/metadata-modules/webhook/jobs/call-webhook-jobs.job';
import { CallWebhookJob } from 'src/engine/metadata-modules/webhook/jobs/call-webhook.job';
import { RecordShareModule } from 'src/engine/record-share/record-share.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    EventLogEmitterModule,
    FlatWebhookModule,
    MetricsModule,
    RecordShareModule,
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
