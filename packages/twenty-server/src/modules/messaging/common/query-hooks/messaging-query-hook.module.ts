import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommonRecordVisibilityModule } from 'src/engine/api/common/common-record-visibility/common-record-visibility.module';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { ApplyAttachmentsVisibilityRestrictionsService } from 'src/modules/messaging/common/query-hooks/attachment/apply-attachments-visibility-restrictions.service';
import { ApplyMessageReactionsVisibilityRestrictionsService } from 'src/modules/messaging/common/query-hooks/message-reaction/apply-message-reactions-visibility-restrictions.service';
import { ApplyMessagesVisibilityRestrictionsService } from 'src/modules/messaging/common/query-hooks/message/apply-messages-visibility-restrictions.service';
import { MessageThreadTargetCreateManyPreQueryHook } from 'src/modules/messaging/common/query-hooks/message-thread-target/message-thread-target-create-many.pre-query-hook';
import { MessageThreadTargetCreateOnePreQueryHook } from 'src/modules/messaging/common/query-hooks/message-thread-target/message-thread-target-create-one.pre-query-hook';

@Module({
  imports: [
    WorkspaceCacheModule,
    CommonRecordVisibilityModule,
    TypeOrmModule.forFeature([MessageChannelEntity]),
  ],
  providers: [
    ApplyMessagesVisibilityRestrictionsService,
    ApplyAttachmentsVisibilityRestrictionsService,
    ApplyMessageReactionsVisibilityRestrictionsService,
    MessageThreadTargetCreateOnePreQueryHook,
    MessageThreadTargetCreateManyPreQueryHook,
  ],
})
export class MessagingQueryHookModule {}
