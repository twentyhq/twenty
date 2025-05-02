import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { AnalyticsModule } from 'src/engine/core-modules/audit/analytics.module';
import { CallWebhookJobsJob } from 'src/modules/webhook/jobs/call-webhook-jobs.job';
import { CallWebhookJob } from 'src/modules/webhook/jobs/call-webhook.job';

@Module({
  imports: [HttpModule, AnalyticsModule],
  providers: [CallWebhookJobsJob, CallWebhookJob],
})
export class WebhookJobModule {}
