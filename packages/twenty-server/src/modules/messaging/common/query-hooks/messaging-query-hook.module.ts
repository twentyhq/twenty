import { Module } from '@nestjs/common';

import { ConnectedAccountDataAccessModule } from 'src/engine/metadata-modules/connected-account/data-access/connected-account-data-access.module';
import { MessageChannelDataAccessModule } from 'src/engine/metadata-modules/message-channel/data-access/message-channel-data-access.module';
import { MessageFolderDataAccessModule } from 'src/engine/metadata-modules/message-folder/data-access/message-folder-data-access.module';
import { ApplyMessagesVisibilityRestrictionsService } from 'src/modules/messaging/common/query-hooks/message/apply-messages-visibility-restrictions.service';
import { MessageChannelUpdateOnePreQueryHook } from 'src/modules/messaging/common/query-hooks/message/message-channel-update-one.pre-query.hook';
import { MessageFindManyPostQueryHook } from 'src/modules/messaging/common/query-hooks/message/message-find-many.post-query.hook';
import { MessageFindOnePostQueryHook } from 'src/modules/messaging/common/query-hooks/message/message-find-one.post-query.hook';
import { MessagingImportManagerModule } from 'src/modules/messaging/message-import-manager/messaging-import-manager.module';

@Module({
  imports: [
    MessagingImportManagerModule,
    ConnectedAccountDataAccessModule,
    MessageChannelDataAccessModule,
    MessageFolderDataAccessModule,
  ],
  providers: [
    ApplyMessagesVisibilityRestrictionsService,
    MessageFindOnePostQueryHook,
    MessageFindManyPostQueryHook,
    MessageChannelUpdateOnePreQueryHook,
  ],
})
export class MessagingQueryHookModule {}
