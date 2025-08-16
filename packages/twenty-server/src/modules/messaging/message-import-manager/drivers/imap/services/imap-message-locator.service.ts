import { Injectable, Logger } from '@nestjs/common';

import { FetchMessageObject, type ImapFlow } from 'imapflow';

import { ImapFindSentMailboxService } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-find-sent-mailbox.service';

export type MessageLocation = {
  messageId: string;
  uid: number;
  mailbox: string;
};

@Injectable()
export class ImapMessageLocatorService {
  private readonly logger = new Logger(ImapMessageLocatorService.name);
  private static readonly FETCH_BATCH_SIZE = 500;

  constructor(
    private readonly imapFindSentMailboxService: ImapFindSentMailboxService,
  ) {}

  async locateAllMessages(
    messageIds: string[],
    client: ImapFlow,
  ): Promise<Map<string, MessageLocation>> {
    const locations = new Map<string, MessageLocation>();
    const mailboxes = await this.getMailboxesToSearch(client);
    const messageIdSet = new Set(messageIds);

    for (const mailbox of mailboxes) {
      await this.searchMailboxForMessages(
        mailbox,
        client,
        messageIdSet,
        locations,
      );
    }

    return locations;
  }

  private async searchMailboxForMessages(
    mailbox: string,
    client: ImapFlow,
    messageIdSet: Set<string>,
    locations: Map<string, MessageLocation>,
  ): Promise<void> {
    let lock;

    try {
      lock = await client.getMailboxLock(mailbox);
      const uids = await client.search({ all: true });

      await this.processBatchedMessages(
        uids,
        mailbox,
        client,
        messageIdSet,
        locations,
      );
    } catch (error) {
      this.logger.warn(`Error searching mailbox ${mailbox}: ${error.message}`);
    } finally {
      lock?.release();
    }
  }

  private async processBatchedMessages(
    uids: number[],
    mailbox: string,
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
        this.processMessage(message, mailbox, messageIdSet, locations);
      }
    }
  }

  private processMessage(
    message: FetchMessageObject,
    mailbox: string,
    messageIdSet: Set<string>,
    locations: Map<string, MessageLocation>,
  ): void {
    const envelopeMessageId = message.envelope?.messageId;

    if (envelopeMessageId && messageIdSet.has(envelopeMessageId)) {
      locations.set(envelopeMessageId, {
        messageId: envelopeMessageId,
        uid: message.uid,
        mailbox,
      });
    }
  }

  private async getMailboxesToSearch(client: ImapFlow): Promise<string[]> {
    const mailboxes = ['INBOX'];

    try {
      const sentFolder =
        await this.imapFindSentMailboxService.findSentMailbox(client);

      if (sentFolder && sentFolder !== 'INBOX') {
        mailboxes.push(sentFolder);
      }
    } catch (error) {
      this.logger.warn(`Failed to find sent folder: ${error.message}`);
    }

    return mailboxes;
  }

  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];

    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }

    return chunks;
  }
}
