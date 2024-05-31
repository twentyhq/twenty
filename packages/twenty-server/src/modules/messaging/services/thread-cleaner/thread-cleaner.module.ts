import { Module } from '@nestjs/common';

import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { ThreadCleanerService } from 'src/modules/messaging/services/thread-cleaner/thread-cleaner.service';
import { MessageThreadWorkspaceEntity } from 'src/modules/messaging/standard-objects/message-thread.workspace-entity';
import { MessageWorkspaceEntity } from 'src/modules/messaging/standard-objects/message.workspace-entity';

@Module({
  imports: [
    ObjectMetadataRepositoryModule.forFeature([
      MessageWorkspaceEntity,
      MessageThreadWorkspaceEntity,
    ]),
  ],
  providers: [ThreadCleanerService],
  exports: [ThreadCleanerService],
})
export class ThreadCleanerModule {}
