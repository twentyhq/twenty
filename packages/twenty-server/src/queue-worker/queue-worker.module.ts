import { Module } from '@nestjs/common';

import { JobsModule } from 'src/engine/integrations/message-queue/jobs.module';
import { IntegrationsModule } from 'src/engine/integrations/integrations.module';

@Module({
  imports: [IntegrationsModule, JobsModule],
})
export class QueueWorkerModule {}
