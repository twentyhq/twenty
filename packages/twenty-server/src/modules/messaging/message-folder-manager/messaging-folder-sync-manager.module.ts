import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { OAuth2ClientManagerModule } from 'src/modules/connected-account/oauth2-client-manager/oauth2-client-manager.module';
import { GmailFoldersErrorHandlerService } from 'src/modules/messaging/message-folder-manager/drivers/gmail/services/gmail-folders-error-handler.service';
import { GmailGetAllFoldersService } from 'src/modules/messaging/message-folder-manager/drivers/gmail/services/gmail-get-all-folders.service';
import { ImapGetAllFoldersService } from 'src/modules/messaging/message-folder-manager/drivers/imap/services/imap-get-all-folders.service';
import { MicrosoftGetAllFoldersService } from 'src/modules/messaging/message-folder-manager/drivers/microsoft/services/microsoft-get-all-folders.service';
import { SyncMessageFoldersService } from 'src/modules/messaging/message-folder-manager/services/sync-message-folders.service';
import { MessagingGmailDriverModule } from 'src/modules/messaging/message-import-manager/drivers/gmail/messaging-gmail-driver.module';
import { MessagingIMAPDriverModule } from 'src/modules/messaging/message-import-manager/drivers/imap/messaging-imap-driver.module';
import { MessagingMicrosoftDriverModule } from 'src/modules/messaging/message-import-manager/drivers/microsoft/messaging-microsoft-driver.module';

@Module({
  imports: [
    FeatureFlagModule,
    WorkspaceDataSourceModule,
    DataSourceModule,
    TypeOrmModule.forFeature([WorkspaceEntity]),
    OAuth2ClientManagerModule,
    MessagingGmailDriverModule,
    MessagingMicrosoftDriverModule,
    MessagingIMAPDriverModule,
  ],
  providers: [
    SyncMessageFoldersService,
    GmailGetAllFoldersService,
    GmailFoldersErrorHandlerService,
    ImapGetAllFoldersService,
    MicrosoftGetAllFoldersService,
  ],
  exports: [SyncMessageFoldersService],
})
export class MessagingFolderSyncManagerModule {}
