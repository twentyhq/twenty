import { Module, OnModuleInit } from '@nestjs/common';
import { DiscoveryService, MetadataScanner } from '@nestjs/core';

import { JobsModule } from 'src/engine/integrations/message-queue/jobs.module';
import { IntegrationsModule } from 'src/engine/integrations/integrations.module';
import { MessageQueueExplorer } from 'src/engine/integrations/message-queue/message-queue.explorer';
import { MessageQueueMetadataAccessor } from 'src/engine/integrations/message-queue/message-queue-metadata.accessor';
import { TwentyORMModule } from 'src/engine/twenty-orm/twenty-orm.module';

@Module({
  imports: [
    TwentyORMModule.register({
      workspaceEntities: ['dist/src/**/*.workspace-entity{.ts,.js}'],
    }),
    IntegrationsModule,
    JobsModule,
  ],
  providers: [
    MessageQueueExplorer,
    DiscoveryService,
    MetadataScanner,
    MessageQueueMetadataAccessor,
  ],
})
export class QueueWorkerModule implements OnModuleInit {
  constructor(private readonly messageQueueExplorer: MessageQueueExplorer) {}

  onModuleInit() {
    this.messageQueueExplorer.onModuleInit();
  }
}
