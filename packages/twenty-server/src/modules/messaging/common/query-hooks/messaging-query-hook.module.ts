import { Module } from '@nestjs/common';

import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { CanAccessMessageThreadService } from 'src/modules/messaging/common/query-hooks/message/can-access-message-thread.service';
import { MessageFindManyPreQueryHook } from 'src/modules/messaging/common/query-hooks/message/message-find-many.pre-query.hook';
import { MessageFindOnePreQueryHook } from 'src/modules/messaging/common/query-hooks/message/message-find-one.pre-query-hook';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Module({
  imports: [
    ObjectMetadataRepositoryModule.forFeature([
      ConnectedAccountWorkspaceEntity,
      WorkspaceMemberWorkspaceEntity,
    ]),
  ],
  providers: [
    CanAccessMessageThreadService,
    MessageFindOnePreQueryHook,
    MessageFindManyPreQueryHook,
  ],
})
export class MessagingQueryHookModule {}
