import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuditModule } from 'src/engine/core-modules/audit/audit.module';
import { MetricsModule } from 'src/engine/core-modules/metrics/metrics.module';
import { ToolModule } from 'src/engine/core-modules/tool/tool.module';
import { WebhookEntity } from 'src/engine/metadata-modules/webhook/entities/webhook.entity';
import { CallWebhookJobsJob } from 'src/engine/metadata-modules/webhook/jobs/call-webhook-jobs.job';
import { CallWebhookJob } from 'src/engine/metadata-modules/webhook/jobs/call-webhook.job';

@Module({
  imports: [
    TypeOrmModule.forFeature([WebhookEntity]),
    AuditModule,
    MetricsModule,
    ToolModule,
  ],
  providers: [CallWebhookJobsJob, CallWebhookJob],
})
export class WebhookJobModule {}
