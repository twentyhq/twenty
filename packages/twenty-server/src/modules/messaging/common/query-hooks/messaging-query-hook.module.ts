import { Module } from '@nestjs/common';

import { ApplyMessagesVisibilityRestrictionsService } from 'src/modules/messaging/common/query-hooks/message/apply-messages-visibility-restrictions.service';
import { MessageChannelUpdateOnePreQueryHook } from 'src/modules/messaging/common/query-hooks/message/message-channel-update-one.pre-query.hook';
import { MessageFindManyPostQueryHook } from 'src/modules/messaging/common/query-hooks/message/message-find-many.post-query.hook';
import { MessageFindOnePostQueryHook } from 'src/modules/messaging/common/query-hooks/message/message-find-one.post-query.hook';
import { MessagingImportManagerModule } from 'src/modules/messaging/message-import-manager/messaging-import-manager.module';

@Module({
  imports: [MessagingImportManagerModule],
  providers: [
    ApplyMessagesVisibilityRestrictionsService,
    MessageFindOnePostQueryHook,
    MessageFindManyPostQueryHook,
    MessageChannelUpdateOnePreQueryHook,
  ],
})
export class MessagingQueryHookModule {}
