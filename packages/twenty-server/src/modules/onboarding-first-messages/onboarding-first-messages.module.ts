import { Module } from '@nestjs/common';

import { OAuth2ClientManagerModule } from 'src/modules/connected-account/oauth2-client-manager/oauth2-client-manager.module';
import { MessagingIMAPDriverModule } from 'src/modules/messaging/message-import-manager/drivers/imap/messaging-imap-driver.module';
import { GmailFirstMessagesService } from 'src/modules/onboarding-first-messages/services/gmail-first-messages.service';
import { ImapFirstMessagesService } from 'src/modules/onboarding-first-messages/services/imap-first-messages.service';
import { MicrosoftFirstMessagesService } from 'src/modules/onboarding-first-messages/services/microsoft-first-messages.service';
import { OnboardingFirstMessagesService } from 'src/modules/onboarding-first-messages/services/onboarding-first-messages.service';

@Module({
  imports: [OAuth2ClientManagerModule, MessagingIMAPDriverModule],
  providers: [
    GmailFirstMessagesService,
    MicrosoftFirstMessagesService,
    ImapFirstMessagesService,
    OnboardingFirstMessagesService,
  ],
  exports: [OnboardingFirstMessagesService],
})
export class OnboardingFirstMessagesModule {}
