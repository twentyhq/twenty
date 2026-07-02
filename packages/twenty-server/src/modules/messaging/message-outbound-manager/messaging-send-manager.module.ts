import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EmailingDomainEntity } from 'src/engine/core-modules/emailing-domain/emailing-domain.entity';
import { EmailingModule } from 'src/modules/emailing/emailing.module';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { MessageFolderEntity } from 'src/engine/metadata-modules/message-folder/entities/message-folder.entity';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { OAuth2ClientManagerModule } from 'src/modules/connected-account/oauth2-client-manager/oauth2-client-manager.module';
import { MessagingIMAPDriverModule } from 'src/modules/messaging/message-import-manager/drivers/imap/messaging-imap-driver.module';
import { MessagingSmtpDriverModule } from 'src/modules/messaging/message-import-manager/drivers/smtp/messaging-smtp-driver.module';
import { MessagingImportManagerModule } from 'src/modules/messaging/message-import-manager/messaging-import-manager.module';
import { MessagingMessageCleanerModule } from 'src/modules/messaging/message-cleaner/messaging-message-cleaner.module';
import { EmailGroupMessageOutboundService } from 'src/modules/messaging/message-outbound-manager/drivers/email-group/services/email-group-message-outbound.service';
import { GmailMessageOutboundService } from 'src/modules/messaging/message-outbound-manager/drivers/gmail/services/gmail-message-outbound.service';
import { ImapSmtpMessageOutboundService } from 'src/modules/messaging/message-outbound-manager/drivers/imap/services/imap-smtp-message-outbound.service';
import { MicrosoftMessageOutboundService } from 'src/modules/messaging/message-outbound-manager/drivers/microsoft/services/microsoft-message-outbound.service';
import { MessagingDraftSendService } from 'src/modules/messaging/message-outbound-manager/services/messaging-draft-send.service';
import { MessagingMessageOutboundService } from 'src/modules/messaging/message-outbound-manager/services/messaging-message-outbound.service';
import { SendEmailService } from 'src/modules/messaging/message-outbound-manager/services/send-email.service';
import { SentMessagePersistenceService } from 'src/modules/messaging/message-outbound-manager/services/sent-message-persistence.service';

@Module({
  imports: [
    OAuth2ClientManagerModule,
    MessagingIMAPDriverModule,
    MessagingSmtpDriverModule,
    MessagingImportManagerModule,
    MessagingMessageCleanerModule,
    EmailingModule,
    TypeOrmModule.forFeature([
      MessageChannelEntity,
      MessageFolderEntity,
      EmailingDomainEntity,
    ]),
  ],
  providers: [
    GmailMessageOutboundService,
    MicrosoftMessageOutboundService,
    ImapSmtpMessageOutboundService,
    EmailGroupMessageOutboundService,
    MessagingMessageOutboundService,
    MessagingDraftSendService,
    SendEmailService,
    SentMessagePersistenceService,
    provideWorkspaceScopedRepository(EmailingDomainEntity),
  ],
  exports: [
    MessagingMessageOutboundService,
    MessagingDraftSendService,
    SendEmailService,
    SentMessagePersistenceService,
  ],
})
export class MessagingSendManagerModule {}
