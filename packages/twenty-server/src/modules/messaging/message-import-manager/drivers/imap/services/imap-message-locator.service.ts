import { Injectable, Logger } from '@nestjs/common';

import { FetchMessageObject, type ImapFlow } from 'imapflow';

import { ImapFindSentFolderService } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-find-sent-folder.service';

export type MessageLocation = {
  messageId: string;
  uid: number;
  folder: string;
};

@Injectable()
export class ImapMessageLocatorService {
  private readonly logger = new Logger(ImapMessageLocatorService.name);
  private static readonly FETCH_BATCH_SIZE = 50;

  constructor(
    private readonly imapFindSentFolderService: ImapFindSentFolderService,
  ) {}

  async locateAllMessages(
    messageIds: string[],
    client: ImapFlow,
  ): Promise<Map<string, MessageLocation>> {
    const locations = new Map<string, MessageLocation>();
    const folders = await this.getFoldersToSearch(client);
    const messageIdSet = new Set(messageIds);

    for (const folder of folders) {
      await this.searchFolderForMessages(
        folder,
        client,
        messageIdSet,
        locations,
      );
    }

    return locations;
  }

  private async searchFolderForMessages(
    folder: string,
    client: ImapFlow,
    messageIdSet: Set<string>,
    locations: Map<string, MessageLocation>,
  ): Promise<void> {
    let lock;

    try {
      lock = await client.getMailboxLock(folder);
      const uids = await client.search({ all: true });

      await this.processBatchedMessages(
        uids,
        folder,
        client,
        messageIdSet,
        locations,
      );
    } catch (error) {
      this.logger.warn(`Error searching folder ${folder}: ${error.message}`);
    } finally {
      lock?.release();
    }
  }

  private async processBatchedMessages(
    uids: number[],
    folder: string,
    client: ImapFlow,
    messageIdSet: Set<string>,
    locations: Map<string, MessageLocation>,
  ): Promise<void> {
    const batches = this.chunkArray(
      uids,
      ImapMessageLocatorService.FETCH_BATCH_SIZE,
    );

    for (const batchUids of batches) {
      const fetchResults = client.fetch(batchUids.join(','), {
        envelope: true,
      });

      for await (const message of fetchResults) {
        this.processMessage(message, folder, messageIdSet, locations);
      }
    }
  }

  private processMessage(
    message: FetchMessageObject,
    folder: string,
    messageIdSet: Set<string>,
    locations: Map<string, MessageLocation>,
  ): void {
    const envelopeMessageId = message.envelope?.messageId;

    if (envelopeMessageId && messageIdSet.has(envelopeMessageId)) {
      locations.set(envelopeMessageId, {
        messageId: envelopeMessageId,
        uid: message.uid,
        folder,
      });
    }
  }

  private async getFoldersToSearch(client: ImapFlow): Promise<string[]> {
    const folders = ['INBOX'];

    try {
      const sentFolder =
        await this.imapFindSentFolderService.findSentFolder(client);

      if (sentFolder && sentFolder !== 'INBOX') {
        folders.push(sentFolder);
      }
    } catch (error) {
      this.logger.warn(`Failed to find sent folder: ${error.message}`);
    }

    return folders;
  }

  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];

    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }

    return chunks;
  }
}
