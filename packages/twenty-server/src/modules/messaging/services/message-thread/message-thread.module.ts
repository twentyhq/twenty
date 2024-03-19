import { Module } from '@nestjs/common';

import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { MessageThreadService } from 'src/modules/messaging/services/message-thread/message-thread.service';
import { MessageChannelMessageAssociationObjectMetadata } from 'src/modules/messaging/standard-objects/message-channel-message-association.object-metadata';
import { MessageThreadObjectMetadata } from 'src/modules/messaging/standard-objects/message-thread.object-metadata';
import { MessageObjectMetadata } from 'src/modules/messaging/standard-objects/message.object-metadata';

@Module({
  imports: [
    ObjectMetadataRepositoryModule.forFeature([
      MessageChannelMessageAssociationObjectMetadata,
      MessageObjectMetadata,
      MessageThreadObjectMetadata,
    ]),
  ],
  providers: [MessageThreadService],
  exports: [MessageThreadService],
})
export class MessageThreadModule {}
