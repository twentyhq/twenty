import { Injectable } from '@nestjs/common';

import { type ImapFlow } from 'imapflow';
import { isDefined } from 'twenty-shared/utils';

import { type MessageFolder } from 'src/modules/messaging/message-folder-manager/interfaces/message-folder-driver.interface';
import { ImapClientProvider } from 'src/modules/messaging/message-import-manager/drivers/imap/providers/imap-client.provider';
import { getImapFolderPath } from 'src/modules/messaging/message-import-manager/drivers/imap/utils/get-imap-folder-path.util';

@Injectable()
export class ImapFirstMessagesService {
  constructor(private readonly imapClientProvider: ImapClientProvider) {}

  async getFirstMessageExternalIds({
    connectedAccountId,
    messageFolders,
    maxCountPerScope,
  }: {
    connectedAccountId: string;
    messageFolders: MessageFolder[];
    maxCountPerScope: number;
  }): Promise<string[]> {
    const foldersToSample = messageFolders.filter(
      (folder) =>
        folder.isSentFolder ||
        getImapFolderPath(folder.externalId)?.toUpperCase() === 'INBOX',
    );

    if (foldersToSample.length === 0) {
      return [];
    }

    const client = await this.imapClientProvider.getClient(connectedAccountId);

    try {
      const messageExternalIds: string[] = [];

      for (const folder of foldersToSample) {
        messageExternalIds.push(
          ...(await this.getFolderFirstMessageExternalIds({
            client,
            folder,
            maxCount: maxCountPerScope,
          })),
        );
      }

      return messageExternalIds;
    } finally {
      await this.imapClientProvider.closeClient(client);
    }
  }

  private async getFolderFirstMessageExternalIds({
    client,
    folder,
    maxCount,
  }: {
    client: ImapFlow;
    folder: MessageFolder;
    maxCount: number;
  }): Promise<string[]> {
    const folderPath = getImapFolderPath(folder.externalId);

    if (!isDefined(folderPath)) {
      return [];
    }

    const lock = await client.getMailboxLock(folderPath);

    try {
      const mailbox = client.mailbox;

      if (!mailbox || typeof mailbox === 'boolean' || mailbox.exists === 0) {
        return [];
      }

      const firstSequenceNumber = Math.max(1, mailbox.exists - maxCount + 1);
      const messageExternalIds: string[] = [];

      for await (const message of client.fetch(`${firstSequenceNumber}:*`, {
        uid: true,
      })) {
        messageExternalIds.push(`${folderPath}:${message.uid}`);
      }

      return messageExternalIds.reverse();
    } finally {
      lock.release();
    }
  }
}
