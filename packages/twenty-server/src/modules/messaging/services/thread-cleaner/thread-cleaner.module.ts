import { Module } from '@nestjs/common';

import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { ThreadCleanerService } from 'src/modules/messaging/services/thread-cleaner/thread-cleaner.service';
import { MessageThreadObjectMetadata } from 'src/modules/messaging/standard-objects/message-thread.object-metadata';
import { MessageObjectMetadata } from 'src/modules/messaging/standard-objects/message.object-metadata';

@Module({
  imports: [
    ObjectMetadataRepositoryModule.forFeature([
      MessageObjectMetadata,
      MessageThreadObjectMetadata,
    ]),
  ],
  providers: [ThreadCleanerService],
  exports: [ThreadCleanerService],
})
export class ThreadCleanerModule {}
