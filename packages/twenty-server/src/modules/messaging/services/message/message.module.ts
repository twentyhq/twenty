import { Module } from '@nestjs/common';

import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { MessageThreadModule } from 'src/modules/messaging/services/message-thread/message-thread.module';
import { MessageService } from 'src/modules/messaging/services/message/message.service';
import { MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/standard-objects/message-channel-message-association.workspace-entity';
import { MessageChannelWorkspaceEntity } from 'src/modules/messaging/standard-objects/message-channel.workspace-entity';
import { MessageThreadWorkspaceEntity } from 'src/modules/messaging/standard-objects/message-thread.workspace-entity';
import { MessageWorkspaceEntity } from 'src/modules/messaging/standard-objects/message.workspace-entity';

@Module({
  imports: [
    WorkspaceDataSourceModule,
    ObjectMetadataRepositoryModule.forFeature([
      MessageChannelMessageAssociationWorkspaceEntity,
      MessageWorkspaceEntity,
      MessageChannelWorkspaceEntity,
      MessageThreadWorkspaceEntity,
    ]),
    MessageThreadModule,
  ],
  providers: [MessageService],
  exports: [MessageService],
})
export class MessageModule {}
