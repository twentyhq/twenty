import { Injectable } from '@nestjs/common';

import { type ImapFlow } from 'imapflow';
import { isDefined } from 'twenty-shared/utils';

import { type MessageFolder } from 'src/modules/messaging/message-folder-manager/interfaces/message-folder-driver.interface';
import { ImapClientProvider } from 'src/modules/messaging/message-import-manager/drivers/imap/providers/imap-client.provider';
import { getImapFolderPath } from 'src/modules/messaging/message-import-manager/drivers/imap/utils/get-imap-folder-path.util';

const IMAP_INBOX_FOLDER_PATH = 'INBOX';

@Injectable()
export class ImapRecentMessagesService {
  constructor(private readonly imapClientProvider: ImapClientProvider) {}

  async getExternalIds({
    connectedAccountId,
    messageFolders,
    maxCountPerScope,
  }: {
    connectedAccountId: string;
    messageFolders: MessageFolder[];
    maxCountPerScope: number;
  }): Promise<string[]> {
    const sentAndInboxFolders = messageFolders.filter(
      (messageFolder) =>
        messageFolder.isSentFolder ||
        getImapFolderPath(messageFolder.externalId)?.toUpperCase() ===
          IMAP_INBOX_FOLDER_PATH,
    );

    if (sentAndInboxFolders.length === 0) {
      return [];
    }

    const imapClient =
      await this.imapClientProvider.getClient(connectedAccountId);

    try {
      const messageExternalIds: string[] = [];

      for (const messageFolder of sentAndInboxFolders) {
        messageExternalIds.push(
          ...(await this.getFolderExternalIds({
            imapClient,
            messageFolder,
            maxCount: maxCountPerScope,
          })),
        );
      }

      return messageExternalIds;
    } finally {
      await this.imapClientProvider.closeClient(imapClient);
    }
  }

  private async getFolderExternalIds({
    imapClient,
    messageFolder,
    maxCount,
  }: {
    imapClient: ImapFlow;
    messageFolder: MessageFolder;
    maxCount: number;
  }): Promise<string[]> {
    const folderPath = getImapFolderPath(messageFolder.externalId);

    if (!isDefined(folderPath)) {
      return [];
    }

    const mailboxLock = await imapClient.getMailboxLock(folderPath);

    try {
      const mailbox = imapClient.mailbox;

      if (!mailbox || typeof mailbox === 'boolean' || mailbox.exists === 0) {
        return [];
      }

      const firstSequenceNumber = Math.max(1, mailbox.exists - maxCount + 1);
      const messageExternalIds: string[] = [];

      for await (const message of imapClient.fetch(`${firstSequenceNumber}:*`, {
        uid: true,
      })) {
        messageExternalIds.push(`${folderPath}:${message.uid}`);
      }

      return messageExternalIds.reverse();
    } finally {
      mailboxLock.release();
    }
  }
}
