import { Module } from '@nestjs/common';

import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { ApplyMessagesVisibilityRestrictionsService } from 'src/modules/messaging/common/query-hooks/message/apply-messages-visibility-restrictions.service';
import { MessageFindManyPostQueryHook } from 'src/modules/messaging/common/query-hooks/message/message-find-many.post-query.hook';
import { MessageFindOnePostQueryHook } from 'src/modules/messaging/common/query-hooks/message/message-find-one.post-query.hook';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Module({
  imports: [
    ObjectMetadataRepositoryModule.forFeature([WorkspaceMemberWorkspaceEntity]),
  ],
  providers: [
    ApplyMessagesVisibilityRestrictionsService,
    MessageFindOnePostQueryHook,
    MessageFindManyPostQueryHook,
  ],
})
export class MessagingQueryHookModule {}
