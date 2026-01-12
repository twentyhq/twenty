import { Module } from '@nestjs/common';

import { ApplyMessagesVisibilityRestrictionsService } from 'src/modules/messaging/common/query-hooks/message/apply-messages-visibility-restrictions.service';
import { MessageChannelUpdateOnePreQueryHook } from 'src/modules/messaging/common/query-hooks/message/message-channel-update-one.pre-query.hook';
import { MessageFindManyPostQueryHook } from 'src/modules/messaging/common/query-hooks/message/message-find-many.post-query.hook';
import { MessageFindOnePostQueryHook } from 'src/modules/messaging/common/query-hooks/message/message-find-one.post-query.hook';
import { MessageFolderUpdateManyPreQueryHook } from 'src/modules/messaging/common/query-hooks/message-folder/message-folder-update-many.pre-query.hook';
import { MessageFolderUpdateOnePreQueryHook } from 'src/modules/messaging/common/query-hooks/message-folder/message-folder-update-one.pre-query.hook';
import { MessagingImportManagerModule } from 'src/modules/messaging/message-import-manager/messaging-import-manager.module';

@Module({
  imports: [MessagingImportManagerModule],
  providers: [
    ApplyMessagesVisibilityRestrictionsService,
    MessageFindOnePostQueryHook,
    MessageFindManyPostQueryHook,
    MessageChannelUpdateOnePreQueryHook,
    MessageFolderUpdateOnePreQueryHook,
    MessageFolderUpdateManyPreQueryHook,
  ],
})
export class MessagingQueryHookModule {}
