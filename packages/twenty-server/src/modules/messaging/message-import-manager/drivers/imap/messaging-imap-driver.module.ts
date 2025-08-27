import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeatureFlag } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { BlocklistWorkspaceEntity } from 'src/modules/blocklist/standard-objects/blocklist.workspace-entity';
import { EmailAliasManagerModule } from 'src/modules/connected-account/email-alias-manager/email-alias-manager.module';
import { MessagingCommonModule } from 'src/modules/messaging/common/messaging-common.module';
import { ImapClientProvider } from 'src/modules/messaging/message-import-manager/drivers/imap/providers/imap-client.provider';
import { ImapFetchByBatchService } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-fetch-by-batch.service';
import { ImapFindSentFolderService } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-find-sent-folder.service';
import { ImapGetAllFoldersService } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-get-all-folders.service';
import { ImapGetMessageListService } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-get-message-list.service';
import { ImapGetMessagesService } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-get-messages.service';
import { ImapHandleErrorService } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-handle-error.service';
import { ImapIncrementalSyncService } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-incremental-sync.service';
import { ImapMessageFetcherService } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-message-fetcher.service';
import { ImapMessageProcessorService } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-message-processor.service';
import { MessageParticipantManagerModule } from 'src/modules/messaging/message-participant-manager/message-participant-manager.module';

@Module({
  imports: [
    HttpModule,
    ObjectMetadataRepositoryModule.forFeature([BlocklistWorkspaceEntity]),
    MessagingCommonModule,
    TypeOrmModule.forFeature([FeatureFlag], 'core'),
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
    ImapGetAllFoldersService,
    ImapHandleErrorService,
    ImapIncrementalSyncService,
    ImapMessageFetcherService,
    ImapMessageProcessorService,
    ImapFindSentFolderService,
  ],
  exports: [
    ImapGetMessagesService,
    ImapGetMessageListService,
    ImapGetAllFoldersService,
    ImapClientProvider,
  ],
})
export class MessagingIMAPDriverModule {}
