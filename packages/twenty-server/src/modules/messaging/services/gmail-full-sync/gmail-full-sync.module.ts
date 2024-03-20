import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { BlocklistObjectMetadata } from 'src/modules/connected-account/standard-objects/blocklist.object-metadata';
import { ConnectedAccountObjectMetadata } from 'src/modules/connected-account/standard-objects/connected-account.object-metadata';
import { FetchMessagesByBatchesModule } from 'src/modules/messaging/services/fetch-messages-by-batches/fetch-messages-by-batches.module';
import { GmailFullSyncService } from 'src/modules/messaging/services/gmail-full-sync/gmail-full-sync.service';
import { MessagingProvidersModule } from 'src/modules/messaging/services/providers/messaging-providers.module';
import { SaveMessagesAndCreateContactsModule } from 'src/modules/messaging/services/save-message-and-create-contact/save-message-and-create-contacts.module';
import { MessageChannelMessageAssociationObjectMetadata } from 'src/modules/messaging/standard-objects/message-channel-message-association.object-metadata';
import { MessageChannelObjectMetadata } from 'src/modules/messaging/standard-objects/message-channel.object-metadata';

@Module({
  imports: [
    MessagingProvidersModule,
    FetchMessagesByBatchesModule,
    ObjectMetadataRepositoryModule.forFeature([
      ConnectedAccountObjectMetadata,
      MessageChannelObjectMetadata,
      MessageChannelMessageAssociationObjectMetadata,
      BlocklistObjectMetadata,
    ]),
    SaveMessagesAndCreateContactsModule,
    TypeOrmModule.forFeature([FeatureFlagEntity], 'core'),
  ],
  providers: [GmailFullSyncService],
  exports: [GmailFullSyncService],
})
export class GmailFullSyncModule {}
