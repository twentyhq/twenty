import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { CallWebhookJobsJob } from 'src/modules/webhook/jobs/call-webhook-jobs.job';
import { CallWebhookJob } from 'src/modules/webhook/jobs/call-webhook.job';
import { AnalyticsModule } from 'src/engine/core-modules/analytics/analytics.module';

@Module({
  imports: [HttpModule, AnalyticsModule],
  providers: [CallWebhookJobsJob, CallWebhookJob],
})
export class WebhookJobModule {}
