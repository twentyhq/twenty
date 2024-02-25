import { Module } from '@nestjs/common';

import { JobsModule } from 'src/integrations/message-queue/jobs.module';
import { IntegrationsModule } from 'src/integrations/integrations.module';

@Module({
  imports: [IntegrationsModule, JobsModule],
})
export class QueueWorkerModule {}
