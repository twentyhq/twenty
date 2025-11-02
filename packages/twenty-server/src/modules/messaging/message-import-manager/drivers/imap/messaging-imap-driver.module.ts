import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { BlocklistWorkspaceEntity } from 'src/modules/blocklist/standard-objects/blocklist.workspace-entity';
import { EmailAliasManagerModule } from 'src/modules/connected-account/email-alias-manager/email-alias-manager.module';
import { MessagingCommonModule } from 'src/modules/messaging/common/messaging-common.module';
import { ImapClientProvider } from 'src/modules/messaging/message-import-manager/drivers/imap/providers/imap-client.provider';
import { ImapFetchByBatchService } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-fetch-by-batch.service';
import { ImapFindSentFolderService } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-find-sent-folder.service';
import { ImapGetMessageListService } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-get-message-list.service';
import { ImapGetMessagesService } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-get-messages.service';
import { ImapIncrementalSyncService } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-incremental-sync.service';
import { ImapMessageFetcherService } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-message-fetcher.service';
import { ImapMessageListFetchErrorHandler } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-message-list-fetch-error-handler.service';
import { ImapMessageProcessorService } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-message-processor.service';
import { ImapMessagesImportErrorHandler } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-messages-import-error-handler.service';
import { ImapMessageTextExtractorService } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-message-text-extractor.service';
import { ImapNetworkErrorHandler } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-network-error-handler.service';
import { MessageParticipantManagerModule } from 'src/modules/messaging/message-participant-manager/message-participant-manager.module';

@Module({
  imports: [
    HttpModule,
    ObjectMetadataRepositoryModule.forFeature([BlocklistWorkspaceEntity]),
    MessagingCommonModule,
    TypeOrmModule.forFeature([FeatureFlagEntity]),
    EmailAliasManagerModule,
    FeatureFlagModule,
    WorkspaceDataSourceModule,
    MessageParticipantManagerModule,
  ],
  providers: [
    ImapClientProvider,
    ImapFetchByBatchService,
    ImapGetMessagesService,
    ImapGetMessageListService,
    ImapNetworkErrorHandler,
    ImapMessageListFetchErrorHandler,
    ImapMessagesImportErrorHandler,
    ImapIncrementalSyncService,
    ImapMessageFetcherService,
    ImapMessageProcessorService,
    ImapFindSentFolderService,
    ImapMessageTextExtractorService,
  ],
  exports: [
    ImapGetMessagesService,
    ImapGetMessageListService,
    ImapClientProvider,
    ImapFindSentFolderService,
  ],
})
export class MessagingIMAPDriverModule {}
