import { Module } from '@nestjs/common';

import { AuditModule } from 'src/engine/core-modules/audit/audit.module';
import { MetricsModule } from 'src/engine/core-modules/metrics/metrics.module';
import { ToolModule } from 'src/engine/core-modules/tool/tool.module';
import { CallWebhookJobsJob } from 'src/engine/metadata-modules/webhook/jobs/call-webhook-jobs.job';
import { CallWebhookJob } from 'src/engine/metadata-modules/webhook/jobs/call-webhook.job';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    AuditModule,
    MetricsModule,
    ToolModule,
    WorkspaceCacheModule,
  ],
  providers: [CallWebhookJobsJob, CallWebhookJob],
})
export class WebhookJobModule {}
