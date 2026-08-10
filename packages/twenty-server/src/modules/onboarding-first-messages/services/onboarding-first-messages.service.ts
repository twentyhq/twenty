import { Injectable } from '@nestjs/common';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { type MessageFolder } from 'src/modules/messaging/message-folder-manager/interfaces/message-folder-driver.interface';
import { ONBOARDING_FIRST_MESSAGES_MAX_PER_SCOPE } from 'src/modules/onboarding-first-messages/constants/onboarding-first-messages-max-per-scope.constant';
import { GmailFirstMessagesService } from 'src/modules/onboarding-first-messages/services/gmail-first-messages.service';
import { ImapFirstMessagesService } from 'src/modules/onboarding-first-messages/services/imap-first-messages.service';
import { MicrosoftFirstMessagesService } from 'src/modules/onboarding-first-messages/services/microsoft-first-messages.service';

// The newest messages a freshly connected account can show, fetched in one
// request per scope so onboarding never waits for the whole mailbox to be listed
@Injectable()
export class OnboardingFirstMessagesService {
  constructor(
    private readonly gmailFirstMessagesService: GmailFirstMessagesService,
    private readonly microsoftFirstMessagesService: MicrosoftFirstMessagesService,
    private readonly imapFirstMessagesService: ImapFirstMessagesService,
  ) {}

  async getFirstMessageExternalIds({
    connectedAccount,
    messageFolders,
  }: {
    connectedAccount: Pick<ConnectedAccountEntity, 'provider' | 'id'>;
    messageFolders: MessageFolder[];
  }): Promise<string[]> {
    const maxCountPerScope = ONBOARDING_FIRST_MESSAGES_MAX_PER_SCOPE;

    switch (connectedAccount.provider) {
      case ConnectedAccountProvider.GOOGLE:
        return this.gmailFirstMessagesService.getFirstMessageExternalIds({
          connectedAccountId: connectedAccount.id,
          maxCountPerScope,
        });
      case ConnectedAccountProvider.MICROSOFT:
        return this.microsoftFirstMessagesService.getFirstMessageExternalIds({
          connectedAccountId: connectedAccount.id,
          maxCountPerScope,
        });
      case ConnectedAccountProvider.IMAP_SMTP_CALDAV:
        return this.imapFirstMessagesService.getFirstMessageExternalIds({
          connectedAccountId: connectedAccount.id,
          messageFolders,
          maxCountPerScope,
        });
      default:
        return [];
    }
  }
}
