import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { OAuth2ClientManagerModule } from 'src/modules/connected-account/oauth2-client-manager/oauth2-client-manager.module';
import { MessagingCommonModule } from 'src/modules/messaging/common/messaging-common.module';
import { MessagingIMAPDriverModule } from 'src/modules/messaging/message-import-manager/drivers/imap/messaging-imap-driver.module';
import { MessagingImportManagerModule } from 'src/modules/messaging/message-import-manager/messaging-import-manager.module';
import { GmailRecentMessagesService } from 'src/modules/onboarding-recent-messages-import/services/gmail-recent-messages.service';
import { ImapRecentMessagesService } from 'src/modules/onboarding-recent-messages-import/services/imap-recent-messages.service';
import { MicrosoftRecentMessagesService } from 'src/modules/onboarding-recent-messages-import/services/microsoft-recent-messages.service';
import { OnboardingRecentMessagesImportService } from 'src/modules/onboarding-recent-messages-import/services/onboarding-recent-messages-import.service';
import { RecentMessagesService } from 'src/modules/onboarding-recent-messages-import/services/recent-messages.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([MessageChannelEntity]),
    OAuth2ClientManagerModule,
    MessagingIMAPDriverModule,
    MessagingCommonModule,
    MessagingImportManagerModule,
  ],
  providers: [
    GmailRecentMessagesService,
    MicrosoftRecentMessagesService,
    ImapRecentMessagesService,
    RecentMessagesService,
    OnboardingRecentMessagesImportService,
  ],
  exports: [OnboardingRecentMessagesImportService],
})
export class OnboardingRecentMessagesImportModule {}
