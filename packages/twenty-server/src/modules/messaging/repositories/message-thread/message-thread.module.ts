import { Module, forwardRef } from '@nestjs/common';

import { MessageThreadRepository } from 'src/modules/messaging/repositories/message-thread/message-thread.repository';
import { MessageModule } from 'src/modules/messaging/repositories/message/message.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository.module';
import { MessageChannelMessageAssociationObjectMetadata } from 'src/modules/messaging/standard-objects/message-channel-message-association.object-metadata';

@Module({
  imports: [
    WorkspaceDataSourceModule,
    ObjectMetadataRepositoryModule.forFeature([
      MessageChannelMessageAssociationObjectMetadata,
    ]),
    forwardRef(() => MessageModule),
  ],
  providers: [MessageThreadRepository],
  exports: [MessageThreadRepository],
})
export class MessageThreadModule {}
