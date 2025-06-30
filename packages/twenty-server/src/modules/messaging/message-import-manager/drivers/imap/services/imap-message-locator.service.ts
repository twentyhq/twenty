import { Injectable, Logger } from '@nestjs/common';

import { ImapFlow } from 'imapflow';

import { findSentMailbox } from 'src/modules/messaging/message-import-manager/drivers/imap/utils/find-sent-mailbox.util';

export type MessageLocation = {
  messageId: string;
  sequence: number;
  mailbox: string;
};

@Injectable()
export class ImapMessageLocatorService {
  private readonly logger = new Logger(ImapMessageLocatorService.name);

  private static readonly IMAP_SEARCH_BATCH_SIZE = 50;

  async locateAllMessages(
    messageIds: string[],
    client: ImapFlow,
  ): Promise<Map<string, MessageLocation>> {
    const locations = new Map<string, MessageLocation>();
    const mailboxes = await this.getMailboxesToSearch(client);

    for (const mailbox of mailboxes) {
      try {
        const lock = await client.getMailboxLock(mailbox);

        try {
          const searchBatches = this.chunkArray(
            messageIds.filter((id) => !locations.has(id)),
            ImapMessageLocatorService.IMAP_SEARCH_BATCH_SIZE,
          );

          for (const batch of searchBatches) {
            await this.locateMessagesInMailbox(
              batch,
              mailbox,
              client,
              locations,
            );
          }
        } finally {
          lock.release();
        }
      } catch (error) {
        this.logger.warn(
          `Error searching mailbox ${mailbox}: ${error.message}`,
        );
      }
    }

    return locations;
  }

  private async locateMessagesInMailbox(
    messageIds: string[],
    mailbox: string,
    client: ImapFlow,
    locations: Map<string, MessageLocation>,
  ): Promise<void> {
    try {
      const orConditions = messageIds.map((id) => ({
        header: { 'message-id': id },
      }));
      const searchResults = await client.search({ or: orConditions });

      if (searchResults.length === 0) return;

      const fetchResults = client.fetch(
        searchResults.map((r) => r.toString()).join(','),
        { envelope: true },
      );

      for await (const message of fetchResults) {
        const messageId = message.envelope?.messageId;

        if (messageId && messageIds.includes(messageId)) {
          locations.set(messageId, {
            messageId,
            sequence: message.seq,
            mailbox,
          });
        }
      }
    } catch (error) {
      this.logger.debug(`Batch search failed in ${mailbox}: ${error.message}`);
    }
  }

  private async getMailboxesToSearch(client: ImapFlow): Promise<string[]> {
    const mailboxes = ['INBOX'];
    const sentFolder = await findSentMailbox(client, this.logger);

    if (sentFolder) {
      mailboxes.push(sentFolder);
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
