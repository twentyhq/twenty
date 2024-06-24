import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceEntity } from 'src/engine/metadata-modules/data-source/data-source.entity';
import { MessagingCommonModule } from 'src/modules/messaging/common/messaging-common.module';
import { MessagingMessageListFetchCronCommand } from 'src/modules/messaging/message-import-manager/crons/commands/messaging-message-list-fetch.cron.command';
import { MessagingMessagesImportCronCommand } from 'src/modules/messaging/message-import-manager/crons/commands/messaging-messages-import.cron.command';
import { MessagingOngoingStaleCronCommand } from 'src/modules/messaging/message-import-manager/crons/commands/messaging-ongoing-stale.cron.command';
import { MessagingMessageListFetchCronJob } from 'src/modules/messaging/message-import-manager/crons/jobs/messaging-message-list-fetch.cron.job';
import { MessagingMessagesImportCronJob } from 'src/modules/messaging/message-import-manager/crons/jobs/messaging-messages-import.cron.job';
import { MessagingOngoingStaleCronJob } from 'src/modules/messaging/message-import-manager/crons/jobs/messaging-ongoing-stale.cron.job';
import { MessagingGmailDriverModule } from 'src/modules/messaging/message-import-manager/drivers/gmail/messaging-gmail-driver.module';
import { MessagingMessageListFetchJob } from 'src/modules/messaging/message-import-manager/jobs/messaging-message-list-fetch.job';
import { MessagingMessagesImportJob } from 'src/modules/messaging/message-import-manager/jobs/messaging-messages-import.job';
import { MessagingOngoingStaleJob } from 'src/modules/messaging/message-import-manager/jobs/messaging-ongoing-stale.job';

@Module({
  imports: [
    MessagingGmailDriverModule,
    MessagingCommonModule,
    TypeOrmModule.forFeature([Workspace], 'core'),
    TypeOrmModule.forFeature([DataSourceEntity], 'metadata'),
  ],
  providers: [
    MessagingMessageListFetchCronCommand,
    MessagingMessagesImportCronCommand,
    MessagingOngoingStaleCronCommand,
    MessagingMessageListFetchJob,
    MessagingMessagesImportJob,
    MessagingOngoingStaleJob,
    MessagingMessageListFetchCronJob,
    MessagingMessagesImportCronJob,
    MessagingOngoingStaleCronJob,
  ],
  exports: [],
})
export class MessagingImportManagerModule {}
