import { Module } from '@nestjs/common';

import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { GmailMessagesImportCronCommand } from 'src/modules/messaging/crons/commands/gmail-messages-import.cron.command';
import { GmailMessageListFetchCronCommand } from 'src/modules/messaging/crons/commands/gmail-message-list-fetch.cron.command';
@Module({
  imports: [
    ObjectMetadataRepositoryModule.forFeature([
      ConnectedAccountWorkspaceEntity,
    ]),
  ],
  providers: [GmailMessageListFetchCronCommand, GmailMessagesImportCronCommand],
})
export class MessagingCronCommandsModule {}
