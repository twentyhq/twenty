import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SecureHttpClientModule } from 'src/engine/core-modules/secure-http-client/secure-http-client.module';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { ConnectedAccountTokenEncryptionModule } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.module';
import { ImapClientProvider } from 'src/modules/messaging/message-import-manager/drivers/imap/providers/imap-client.provider';
import { ImapFindDraftsFolderService } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-find-drafts-folder.service';
import { ImapFindSentFolderService } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-find-sent-folder.service';
import { ImapGetMessageListService } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-get-message-list.service';
import { ImapGetMessagesService } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-get-messages.service';
import { ImapMessageListFetchErrorHandler } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-message-list-fetch-error-handler.service';
import { ImapMessageParserService } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-message-parser.service';
import { ImapMessagesImportErrorHandler } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-messages-import-error-handler.service';
import { ImapSyncService } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-sync.service';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([ConnectedAccountEntity]),
    SecureHttpClientModule,
    ConnectedAccountTokenEncryptionModule,
  ],
  providers: [
    ImapClientProvider,
    ImapGetMessagesService,
    ImapGetMessageListService,
    ImapMessageListFetchErrorHandler,
    ImapMessagesImportErrorHandler,
    ImapSyncService,
    ImapMessageParserService,
    ImapFindDraftsFolderService,
    ImapFindSentFolderService,
  ],
  exports: [
    ImapGetMessagesService,
    ImapGetMessageListService,
    ImapClientProvider,
    ImapFindDraftsFolderService,
    ImapFindSentFolderService,
  ],
})
export class MessagingIMAPDriverModule {}
