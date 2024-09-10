import { Module } from '@nestjs/common';

import { BlocklistItemDeleteMessagesJob } from 'src/modules/messaging/blocklist-manager/jobs/messaging-blocklist-item-delete-messages.job';
import { BlocklistReimportMessagesJob } from 'src/modules/messaging/blocklist-manager/jobs/messaging-blocklist-reimport-messages.job';
import { MessagingBlocklistListener } from 'src/modules/messaging/blocklist-manager/listeners/messaging-blocklist.listener';
import { MessagingCommonModule } from 'src/modules/messaging/common/messaging-common.module';
import { MessagingMessageCleanerModule } from 'src/modules/messaging/message-cleaner/messaging-message-cleaner.module';

@Module({
  imports: [MessagingCommonModule, MessagingMessageCleanerModule],
  providers: [
    MessagingBlocklistListener,
    BlocklistItemDeleteMessagesJob,
    BlocklistReimportMessagesJob,
  ],
  exports: [],
})
export class MessagingBlocklistManagerModule {}
