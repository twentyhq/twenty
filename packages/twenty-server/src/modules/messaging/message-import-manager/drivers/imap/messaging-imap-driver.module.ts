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
import { ImapIdleService } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-idle.service';

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
    ImapGetMessagesService,
    ImapGetMessageListService,
    ImapMessageListFetchErrorHandler,
    ImapMessagesImportErrorHandler,
    ImapSyncService,
    ImapMessageParserService,
    ImapFindSentFolderService,
    ImapMessageTextExtractorService,
    ImapIdleService,
  ],
  exports: [
    ImapGetMessagesService,
    ImapGetMessageListService,
    ImapClientProvider,
    ImapFindSentFolderService,
    ImapIdleService,
  ],
})
export class MessagingIMAPDriverModule { }
