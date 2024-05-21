import { Module } from '@nestjs/common';

import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { GmailFetchMessagesFromCacheCronCommand } from 'src/modules/messaging/crons/commands/gmail-fetch-messages-from-cache.cron.command';
import { GmailPartialSyncCronCommand } from 'src/modules/messaging/crons/commands/gmail-partial-sync.cron.command';
@Module({
  imports: [
    ObjectMetadataRepositoryModule.forFeature([
      ConnectedAccountWorkspaceEntity,
    ]),
  ],
  providers: [
    GmailPartialSyncCronCommand,
    GmailFetchMessagesFromCacheCronCommand,
  ],
})
export class MessagingCronCommandsModule {}
