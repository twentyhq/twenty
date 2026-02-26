import { Module } from '@nestjs/common';

import { TokenModule } from 'src/engine/core-modules/auth/token/token.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';
import { OAuth2ClientManagerModule } from 'src/modules/connected-account/oauth2-client-manager/oauth2-client-manager.module';
import { MessageAttachmentController } from 'src/modules/messaging/message-attachment-manager/controllers/message-attachment.controller';
import { GmailAttachmentDownloadService } from 'src/modules/messaging/message-attachment-manager/drivers/gmail-attachment-download.service';
import { ImapAttachmentDownloadService } from 'src/modules/messaging/message-attachment-manager/drivers/imap-attachment-download.service';
import { MicrosoftAttachmentDownloadService } from 'src/modules/messaging/message-attachment-manager/drivers/microsoft-attachment-download.service';
import { MessagingAttachmentDownloadService } from 'src/modules/messaging/message-attachment-manager/services/messaging-attachment-download.service';
import { MessagingIMAPDriverModule } from 'src/modules/messaging/message-import-manager/drivers/imap/messaging-imap-driver.module';

@Module({
  imports: [
    TokenModule,
    WorkspaceCacheStorageModule,
    OAuth2ClientManagerModule,
    MessagingIMAPDriverModule,
  ],
  controllers: [MessageAttachmentController],
  providers: [
    MessagingAttachmentDownloadService,
    GmailAttachmentDownloadService,
    MicrosoftAttachmentDownloadService,
    ImapAttachmentDownloadService,
  ],
  exports: [MessagingAttachmentDownloadService],
})
export class MessagingAttachmentManagerModule {}
