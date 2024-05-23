import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { BlocklistWorkspaceEntity } from 'src/modules/connected-account/standard-objects/blocklist.workspace-entity';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { FetchMessagesByBatchesModule } from 'src/modules/messaging/services/fetch-messages-by-batches/fetch-messages-by-batches.module';
import { GmailGetHistoryService } from 'src/modules/messaging/services/gmail-partial-message-list-fetch/gmail-get-history.service';
import { GmailPartialMessageListFetchErrorHandlingService } from 'src/modules/messaging/services/gmail-partial-message-list-fetch/gmail-partial-message-list-fetch-error-handling.service';
import { GmailPartialMessageListFetchV2Service } from 'src/modules/messaging/services/gmail-partial-message-list-fetch/gmail-partial-message-list-fetch-v2.service';
import { GmailPartialMessageListFetchService } from 'src/modules/messaging/services/gmail-partial-message-list-fetch/gmail-partial-message-list-fetch.service';
import { MessageModule } from 'src/modules/messaging/services/message/message.module';
import { MessagingProvidersModule } from 'src/modules/messaging/services/providers/messaging-providers.module';
import { SetMessageChannelSyncStatusModule } from 'src/modules/messaging/services/set-message-channel-sync-status/set-message-channel-sync-status.module';
import { MessageChannelWorkspaceEntity } from 'src/modules/messaging/standard-objects/message-channel.workspace-entity';

@Module({
  imports: [
    MessagingProvidersModule,
    FetchMessagesByBatchesModule,
    ObjectMetadataRepositoryModule.forFeature([
      ConnectedAccountWorkspaceEntity,
      MessageChannelWorkspaceEntity,
      BlocklistWorkspaceEntity,
    ]),
    MessageModule,
    TypeOrmModule.forFeature([FeatureFlagEntity], 'core'),
    WorkspaceDataSourceModule,
    SetMessageChannelSyncStatusModule,
  ],
  providers: [
    GmailPartialMessageListFetchService,
    GmailPartialMessageListFetchV2Service,
    GmailPartialMessageListFetchErrorHandlingService,
    GmailGetHistoryService,
  ],
  exports: [
    GmailPartialMessageListFetchService,
    GmailPartialMessageListFetchV2Service,
  ],
})
export class GmailPartialMessageListFetchModule {}
