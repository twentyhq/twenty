import { Injectable } from '@nestjs/common';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import {
  MessageImportDriverException,
  MessageImportDriverExceptionCode,
} from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';
import { type MessageFolder } from 'src/modules/messaging/message-folder-manager/interfaces/message-folder-driver.interface';
import { RECENT_MESSAGES_MAX_COUNT } from 'src/modules/onboarding-recent-messages-import/constants/recent-messages-max-count.constant';
import { GmailRecentMessagesService } from 'src/modules/onboarding-recent-messages-import/services/gmail-recent-messages.service';
import { ImapRecentMessagesService } from 'src/modules/onboarding-recent-messages-import/services/imap-recent-messages.service';
import { MicrosoftRecentMessagesService } from 'src/modules/onboarding-recent-messages-import/services/microsoft-recent-messages.service';

@Injectable()
export class RecentMessagesService {
  constructor(
    private readonly gmailRecentMessagesService: GmailRecentMessagesService,
    private readonly microsoftRecentMessagesService: MicrosoftRecentMessagesService,
    private readonly imapRecentMessagesService: ImapRecentMessagesService,
  ) {}

  async getExternalIds({
    connectedAccount,
    messageFolders,
  }: {
    connectedAccount: Pick<ConnectedAccountEntity, 'provider' | 'id'>;
    messageFolders: MessageFolder[];
  }): Promise<string[]> {
    const externalIds = await this.getExternalIdsByProvider({
      connectedAccount,
      messageFolders,
    });

    return [...new Set(externalIds)];
  }

  private async getExternalIdsByProvider({
    connectedAccount,
    messageFolders,
  }: {
    connectedAccount: Pick<ConnectedAccountEntity, 'provider' | 'id'>;
    messageFolders: MessageFolder[];
  }): Promise<string[]> {
    const maxCount = RECENT_MESSAGES_MAX_COUNT;

    switch (connectedAccount.provider) {
      case ConnectedAccountProvider.GOOGLE:
        return this.gmailRecentMessagesService.getExternalIds({
          connectedAccountId: connectedAccount.id,
          maxCount,
        });
      case ConnectedAccountProvider.MICROSOFT:
        return this.microsoftRecentMessagesService.getExternalIds({
          connectedAccountId: connectedAccount.id,
          maxCount,
        });
      case ConnectedAccountProvider.IMAP_SMTP_CALDAV:
        return this.imapRecentMessagesService.getExternalIds({
          connectedAccountId: connectedAccount.id,
          messageFolders,
          maxCount,
        });
      default:
        throw new MessageImportDriverException(
          `Provider ${connectedAccount.provider} is not supported`,
          MessageImportDriverExceptionCode.PROVIDER_NOT_SUPPORTED,
        );
    }
  }
}
