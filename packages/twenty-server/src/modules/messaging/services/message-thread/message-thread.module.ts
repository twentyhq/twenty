import { Module } from '@nestjs/common';

import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { MessageThreadService } from 'src/modules/messaging/services/message-thread/message-thread.service';
import { MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/standard-objects/message-channel-message-association.workspace-entity';
import { MessageThreadWorkspaceEntity } from 'src/modules/messaging/standard-objects/message-thread.workspace-entity';
import { MessageWorkspaceEntity } from 'src/modules/messaging/standard-objects/message.workspace-entity';

@Module({
  imports: [
    ObjectMetadataRepositoryModule.forFeature([
      MessageChannelMessageAssociationWorkspaceEntity,
      MessageWorkspaceEntity,
      MessageThreadWorkspaceEntity,
    ]),
  ],
  providers: [MessageThreadService],
  exports: [MessageThreadService],
})
export class MessageThreadModule {}
