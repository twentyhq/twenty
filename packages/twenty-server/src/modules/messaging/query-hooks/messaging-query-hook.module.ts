import { Module } from '@nestjs/common';

import { MessageFindManyPreQueryHook } from 'src/modules/messaging/query-hooks/message/message-find-many.pre-query.hook';
import { MessageFindOnePreQueryHook } from 'src/modules/messaging/query-hooks/message/message-find-one.pre-query-hook';
import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { WorkspaceMemberObjectMetadata } from 'src/modules/workspace-member/standard-objects/workspace-member.object-metadata';
import { MessageChannelMessageAssociationObjectMetadata } from 'src/modules/messaging/standard-objects/message-channel-message-association.object-metadata';
import { ConnectedAccountObjectMetadata } from 'src/modules/connected-account/standard-objects/connected-account.object-metadata';
import { MessageChannelObjectMetadata } from 'src/modules/messaging/standard-objects/message-channel.object-metadata';

@Module({
  imports: [
    ObjectMetadataRepositoryModule.forFeature([
      MessageChannelMessageAssociationObjectMetadata,
      MessageChannelObjectMetadata,
      ConnectedAccountObjectMetadata,
      WorkspaceMemberObjectMetadata,
    ]),
  ],
  providers: [
    {
      provide: MessageFindOnePreQueryHook.name,
      useClass: MessageFindOnePreQueryHook,
    },
    {
      provide: MessageFindManyPreQueryHook.name,
      useClass: MessageFindManyPreQueryHook,
    },
  ],
})
export class MessagingQueryHookModule {}
