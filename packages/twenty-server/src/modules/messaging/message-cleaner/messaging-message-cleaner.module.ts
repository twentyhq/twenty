import { Module } from '@nestjs/common';

import { TwentyORMModule } from 'src/engine/twenty-orm/twenty-orm.module';
import { MessageThreadWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-thread.workspace-entity';
import { MessageWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message.workspace-entity';
import { MessagingConnectedAccountDeletionCleanupJob } from 'src/modules/messaging/message-cleaner/jobs/messaging-connected-account-deletion-cleanup.job';
import { MessagingMessageCleanerConnectedAccountListener } from 'src/modules/messaging/message-cleaner/listeners/messaging-message-cleaner-connected-account.listener';
import { MessagingMessageCleanerService } from 'src/modules/messaging/message-cleaner/services/messaging-message-cleaner.service';

@Module({
  imports: [
    TwentyORMModule.forFeature([
      MessageWorkspaceEntity,
      MessageThreadWorkspaceEntity,
    ]),
  ],
  providers: [
    MessagingMessageCleanerService,
    MessagingConnectedAccountDeletionCleanupJob,
    MessagingMessageCleanerConnectedAccountListener,
  ],
  exports: [MessagingMessageCleanerService],
})
export class MessagingMessageCleanerModule {}
