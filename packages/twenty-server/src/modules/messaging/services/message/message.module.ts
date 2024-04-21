import { Module } from '@nestjs/common';

import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { AttachmentObjectMetadata } from 'src/modules/attachment/standard-objects/attachment.object-metadata';
import { MessageThreadModule } from 'src/modules/messaging/services/message-thread/message-thread.module';
import { MessageService } from 'src/modules/messaging/services/message/message.service';
import { MessageChannelMessageAssociationObjectMetadata } from 'src/modules/messaging/standard-objects/message-channel-message-association.object-metadata';
import { MessageChannelObjectMetadata } from 'src/modules/messaging/standard-objects/message-channel.object-metadata';
import { MessageThreadObjectMetadata } from 'src/modules/messaging/standard-objects/message-thread.object-metadata';
import { MessageObjectMetadata } from 'src/modules/messaging/standard-objects/message.object-metadata';

@Module({
  imports: [
    WorkspaceDataSourceModule,
    ObjectMetadataRepositoryModule.forFeature([
      MessageChannelMessageAssociationObjectMetadata,
      MessageObjectMetadata,
      MessageChannelObjectMetadata,
      MessageThreadObjectMetadata,
      AttachmentObjectMetadata,
    ]),
    MessageThreadModule,
  ],
  providers: [MessageService],
  exports: [MessageService],
})
export class MessageModule {}
