import { Module } from '@nestjs/common';

import { OAuth2ClientManagerModule } from 'src/modules/connected-account/oauth2-client-manager/oauth2-client-manager.module';
import { MessagingIMAPDriverModule } from 'src/modules/messaging/message-import-manager/drivers/imap/messaging-imap-driver.module';
import { MessagingSmtpDriverModule } from 'src/modules/messaging/message-import-manager/drivers/smtp/messaging-smtp-driver.module';
import { GmailMessageOutboundService } from 'src/modules/messaging/message-outbound-manager/drivers/gmail/services/gmail-message-outbound.service';
import { ImapSmtpMessageOutboundService } from 'src/modules/messaging/message-outbound-manager/drivers/imap/services/imap-smtp-message-outbound.service';
import { MicrosoftMessageOutboundService } from 'src/modules/messaging/message-outbound-manager/drivers/microsoft/services/microsoft-message-outbound.service';
import { MessagingMessageOutboundService } from 'src/modules/messaging/message-outbound-manager/services/messaging-message-outbound.service';

@Module({
  imports: [
    OAuth2ClientManagerModule,
    MessagingIMAPDriverModule,
    MessagingSmtpDriverModule,
  ],
  providers: [
    GmailMessageOutboundService,
    MicrosoftMessageOutboundService,
    ImapSmtpMessageOutboundService,
    MessagingMessageOutboundService,
  ],
  exports: [MessagingMessageOutboundService],
})
export class MessagingSendManagerModule {}
