import { Module } from '@nestjs/common';

import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { ApplyMessagesVisibilityRestrictionsService } from 'src/modules/messaging/common/query-hooks/message/apply-messages-visibility-restrictions.service';
import { CanAccessMessageThreadService } from 'src/modules/messaging/common/query-hooks/message/can-access-message-thread.service';
import { MessageFindManyPostQueryHook } from 'src/modules/messaging/common/query-hooks/message/message-find-many.post-query.hook';
import { MessageFindManyPreQueryHook } from 'src/modules/messaging/common/query-hooks/message/message-find-many.pre-query.hook';
import { MessageFindOnePostQueryHook } from 'src/modules/messaging/common/query-hooks/message/message-find-one.post-query.hook';
import { MessageFindOnePreQueryHook } from 'src/modules/messaging/common/query-hooks/message/message-find-one.pre-query-hook';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Module({
  imports: [
    ObjectMetadataRepositoryModule.forFeature([WorkspaceMemberWorkspaceEntity]),
  ],
  providers: [
    CanAccessMessageThreadService,
    ApplyMessagesVisibilityRestrictionsService,
    MessageFindOnePreQueryHook,
    MessageFindManyPreQueryHook,
    MessageFindOnePostQueryHook,
    MessageFindManyPostQueryHook,
  ],
})
export class MessagingQueryHookModule {}
