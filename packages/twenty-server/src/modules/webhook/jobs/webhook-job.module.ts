import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { AuditModule } from 'src/engine/core-modules/audit/audit.module';
import { CallWebhookJobsJob } from 'src/modules/webhook/jobs/call-webhook-jobs.job';
import { CallWebhookJob } from 'src/modules/webhook/jobs/call-webhook.job';

@Module({
  imports: [HttpModule, AuditModule],
  providers: [CallWebhookJobsJob, CallWebhookJob],
})
export class WebhookJobModule {}
