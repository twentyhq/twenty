import { Module } from '@nestjs/common';

import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { ConnectedAccountObjectMetadata } from 'src/modules/connected-account/standard-objects/connected-account.object-metadata';
import { GmailFetchMessagesFromCacheCronCommand } from 'src/modules/messaging/commands/crons/gmail-fetch-messages-from-cache.cron.command';
import { GmailPartialSyncCronCommand } from 'src/modules/messaging/commands/crons/gmail-partial-sync.cron.command';

@Module({
  imports: [
    ObjectMetadataRepositoryModule.forFeature([ConnectedAccountObjectMetadata]),
  ],
  providers: [
    GmailPartialSyncCronCommand,
    GmailFetchMessagesFromCacheCronCommand,
  ],
})
export class MessagingCommandModule {}
