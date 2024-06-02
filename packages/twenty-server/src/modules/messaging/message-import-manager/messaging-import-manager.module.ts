import { Module } from '@nestjs/common';

import { MessagingCommonModule } from 'src/modules/messaging/common/messaging-common.module';
import { MessagingMessageListFetchCronCommand } from 'src/modules/messaging/message-import-manager/crons/commands/messaging-message-list-fetch.cron.command';
import { MessagingMessagesImportCronCommand } from 'src/modules/messaging/message-import-manager/crons/commands/messaging-messages-import.cron.command';
import { MessagingGmailDriverModule } from 'src/modules/messaging/message-import-manager/drivers/gmail/messaging-gmail-driver.module';
import { MessagingMessageListFetchJob } from 'src/modules/messaging/message-import-manager/jobs/messaging-message-list-fetch.job';
import { MessagingMessagesImportJob } from 'src/modules/messaging/message-import-manager/jobs/messaging-messages-import.job';

@Module({
  imports: [MessagingGmailDriverModule, MessagingCommonModule],
  providers: [
    MessagingMessageListFetchCronCommand,
    MessagingMessagesImportCronCommand,
    {
      provide: MessagingMessageListFetchJob.name,
      useClass: MessagingMessageListFetchJob,
    },
    {
      provide: MessagingMessagesImportJob.name,
      useClass: MessagingMessagesImportJob,
    },
  ],
  exports: [],
})
export class MessagingImportManagerModule {}
