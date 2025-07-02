import { Injectable, Logger } from '@nestjs/common';

import { FetchMessageObject, ImapFlow } from 'imapflow';
import { ParsedMail, simpleParser } from 'mailparser';

import { ImapHandleErrorService } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-handle-error.service';
import { MessageLocation } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-message-locator.service';

export type MessageFetchResult = {
  messageId: string;
  parsed: ParsedMail | null;
  processingTimeMs?: number;
};

@Injectable()
export class ImapMessageProcessorService {
  private readonly logger = new Logger(ImapMessageProcessorService.name);

  constructor(
    private readonly imapHandleErrorService: ImapHandleErrorService,
  ) {}

  async processMessagesByIds(
    messageIds: string[],
    messageLocations: Map<string, MessageLocation>,
    client: ImapFlow,
  ): Promise<MessageFetchResult[]> {
    if (!messageIds.length) {
      return [];
    }

    const results: MessageFetchResult[] = [];

    const messagesByMailbox = new Map<string, MessageLocation[]>();
    const notFoundIds: string[] = [];

    for (const messageId of messageIds) {
      const location = messageLocations.get(messageId);

      if (location) {
        const locations = messagesByMailbox.get(location.mailbox) || [];

        locations.push(location);
        messagesByMailbox.set(location.mailbox, locations);
      } else {
        notFoundIds.push(messageId);
      }
    }

    const fetchPromises = Array.from(messagesByMailbox.entries()).map(
      ([mailbox, locations]) =>
        this.fetchMessagesFromMailbox(locations, client, mailbox),
    );

    const mailboxResults = await Promise.allSettled(fetchPromises);

    for (const result of mailboxResults) {
      if (result.status === 'fulfilled') {
        results.push(...result.value);
      } else {
        this.logger.error(`Mailbox batch fetch failed: ${result.reason}`);
      }
    }

    for (const messageId of notFoundIds) {
      results.push({
        messageId,
        parsed: null,
        processingTimeMs: 0,
      });
    }

    return results;
  }

  private async fetchMessagesFromMailbox(
    messageLocations: MessageLocation[],
    client: ImapFlow,
    mailbox: string,
  ): Promise<MessageFetchResult[]> {
    if (!messageLocations.length) return [];

    try {
      const lock = await client.getMailboxLock(mailbox);

      try {
        return await this.fetchMessagesWithSequences(messageLocations, client);
      } finally {
        lock.release();
      }
    } catch (error) {
      this.logger.error(
        `Failed to fetch messages from mailbox ${mailbox}: ${error.message}`,
      );

      return messageLocations.map((location) =>
        this.createErrorResult(location.messageId, error as Error, Date.now()),
      );
    }
  }

  private async fetchMessagesWithSequences(
    messageLocations: MessageLocation[],
    client: ImapFlow,
  ): Promise<MessageFetchResult[]> {
    const startTime = Date.now();
    const results: MessageFetchResult[] = [];

    try {
      const sequences = messageLocations.map((loc) => loc.sequence.toString());
      const sequenceSet = sequences.join(',');

      const fetchResults = client.fetch(sequenceSet, {
        source: true,
        envelope: true,
      });

      const messagesData = new Map<number, FetchMessageObject>();

      for await (const message of fetchResults) {
        messagesData.set(message.seq, message);
      }

      for (const location of messageLocations) {
        const messageData = messagesData.get(location.sequence);

        if (messageData) {
          const result = await this.processMessageData(
            location.messageId,
            messageData,
            startTime,
          );

          results.push(result);
        } else {
          results.push({
            messageId: location.messageId,
            parsed: null,
            processingTimeMs: Date.now() - startTime,
          });
        }
      }
    } catch (error) {
      this.logger.error(`Batch fetch failed: ${error.message}`);

      return messageLocations.map((location) =>
        this.createErrorResult(location.messageId, error as Error, startTime),
      );
    }

    return results;
  }

  private async processMessageData(
    messageId: string,
    messageData: FetchMessageObject,
    startTime: number,
  ): Promise<MessageFetchResult> {
    try {
      const rawContent = messageData.source?.toString() || '';

      if (!rawContent) {
        this.logger.debug(`No source content for message ${messageId}`);

        return {
          messageId,
          parsed: null,
          processingTimeMs: Date.now() - startTime,
        };
      }

      const parsed = await this.parseMessage(rawContent, messageId);
      const processingTime = Date.now() - startTime;

      this.logger.debug(
        `Processed message ${messageId} in ${processingTime}ms`,
      );

      return {
        messageId,
        parsed,
        processingTimeMs: processingTime,
      };
    } catch (error) {
      return this.createErrorResult(messageId, error as Error, startTime);
    }
  }

  private async parseMessage(
    rawContent: string,
    messageId: string,
  ): Promise<ParsedMail> {
    try {
      return await simpleParser(rawContent);
    } catch (error) {
      this.logger.error(
        `Failed to parse message ${messageId}: ${error.message}`,
      );
      throw error;
    }
  }

  createErrorResult(
    messageId: string,
    error: Error,
    startTime: number,
  ): MessageFetchResult {
    const processingTime = Date.now() - startTime;

    this.logger.error(`Failed to fetch message ${messageId}: ${error.message}`);

    this.imapHandleErrorService.handleImapMessagesImportError(error, messageId);

    return {
      messageId,
      parsed: null,
      processingTimeMs: processingTime,
    };
  }

  createErrorResults(messageIds: string[], error: Error): MessageFetchResult[] {
    return messageIds.map((messageId) => {
      this.logger.error(
        `Failed to fetch message ${messageId}: ${error.message}`,
      );

      this.imapHandleErrorService.handleImapMessagesImportError(
        error,
        messageId,
      );

      return {
        messageId,
        parsed: null,
      };
    });
  }
}
