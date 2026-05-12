import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { MessageFolderEntity } from 'src/engine/metadata-modules/message-folder/entities/message-folder.entity';
import { OAuth2ClientManagerModule } from 'src/modules/connected-account/oauth2-client-manager/oauth2-client-manager.module';
import { MessagingIMAPDriverModule } from 'src/modules/messaging/message-import-manager/drivers/imap/messaging-imap-driver.module';
import { MessagingSmtpDriverModule } from 'src/modules/messaging/message-import-manager/drivers/smtp/messaging-smtp-driver.module';
import { MessagingImportManagerModule } from 'src/modules/messaging/message-import-manager/messaging-import-manager.module';
import { GmailMessageOutboundService } from 'src/modules/messaging/message-outbound-manager/drivers/gmail/services/gmail-message-outbound.service';
import { ImapSmtpMessageOutboundService } from 'src/modules/messaging/message-outbound-manager/drivers/imap/services/imap-smtp-message-outbound.service';
import { MicrosoftMessageOutboundService } from 'src/modules/messaging/message-outbound-manager/drivers/microsoft/services/microsoft-message-outbound.service';
import { MessagingMessageOutboundService } from 'src/modules/messaging/message-outbound-manager/services/messaging-message-outbound.service';
import { SendEmailService } from 'src/modules/messaging/message-outbound-manager/services/send-email.service';
import { SentMessagePersistenceService } from 'src/modules/messaging/message-outbound-manager/services/sent-message-persistence.service';

@Module({
  imports: [
    OAuth2ClientManagerModule,
    MessagingIMAPDriverModule,
    MessagingSmtpDriverModule,
    MessagingImportManagerModule,
    TypeOrmModule.forFeature([MessageChannelEntity, MessageFolderEntity]),
  ],
  providers: [
    GmailMessageOutboundService,
    MicrosoftMessageOutboundService,
    ImapSmtpMessageOutboundService,
    MessagingMessageOutboundService,
    SendEmailService,
    SentMessagePersistenceService,
  ],
  exports: [
    MessagingMessageOutboundService,
    SendEmailService,
    SentMessagePersistenceService,
  ],
})
export class MessagingSendManagerModule {}
