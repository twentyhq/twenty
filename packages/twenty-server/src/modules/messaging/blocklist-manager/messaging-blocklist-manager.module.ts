import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { BlocklistItemDeleteMessagesJob } from 'src/modules/messaging/blocklist-manager/jobs/messaging-blocklist-item-delete-messages.job';
import { BlocklistReimportMessagesJob } from 'src/modules/messaging/blocklist-manager/jobs/messaging-blocklist-reimport-messages.job';
import { MessagingBlocklistListener } from 'src/modules/messaging/blocklist-manager/listeners/messaging-blocklist.listener';
import { MessagingCommonModule } from 'src/modules/messaging/common/messaging-common.module';
import { MessagingMessageCleanerModule } from 'src/modules/messaging/message-cleaner/messaging-message-cleaner.module';

@Module({
  imports: [
    MessagingCommonModule,
    MessagingMessageCleanerModule,
    TypeOrmModule.forFeature([
      MessageChannelEntity,
      ConnectedAccountEntity,
      UserWorkspaceEntity,
    ]),
  ],
  providers: [
    MessagingBlocklistListener,
    BlocklistItemDeleteMessagesJob,
    BlocklistReimportMessagesJob,
  ],
  exports: [],
})
export class MessagingBlocklistManagerModule {}
