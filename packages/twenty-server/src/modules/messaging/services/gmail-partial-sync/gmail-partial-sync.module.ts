import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeatureFlagEntity } from 'src/engine/modules/feature-flag/feature-flag.entity';
import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { BlocklistObjectMetadata } from 'src/modules/connected-account/standard-objects/blocklist.object-metadata';
import { ConnectedAccountObjectMetadata } from 'src/modules/connected-account/standard-objects/connected-account.object-metadata';
import { FetchMessagesByBatchesModule } from 'src/modules/messaging/services/fetch-messages-by-batches/fetch-messages-by-batches.module';
import { GmailPartialSyncService } from 'src/modules/messaging/services/gmail-partial-sync/gmail-partial-sync.service';
import { MessageModule } from 'src/modules/messaging/services/message/message.module';
import { MessagingProvidersModule } from 'src/modules/messaging/services/providers/messaging-providers.module';
import { SaveMessagesAndCreateContactsModule } from 'src/modules/messaging/services/save-message-and-create-contact/save-message-and-create-contacts.module';
import { MessageChannelObjectMetadata } from 'src/modules/messaging/standard-objects/message-channel.object-metadata';

@Module({
  imports: [
    MessagingProvidersModule,
    FetchMessagesByBatchesModule,
    ObjectMetadataRepositoryModule.forFeature([
      ConnectedAccountObjectMetadata,
      MessageChannelObjectMetadata,
      BlocklistObjectMetadata,
    ]),
    MessageModule,
    SaveMessagesAndCreateContactsModule,
    TypeOrmModule.forFeature([FeatureFlagEntity], 'core'),
  ],
  providers: [GmailPartialSyncService],
  exports: [GmailPartialSyncService],
})
export class GmailPartialSyncModule {}
