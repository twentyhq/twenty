import { Injectable, Logger } from '@nestjs/common';

import { type FetchMessageObject, type ImapFlow } from 'imapflow';
import { type ParsedMail, simpleParser } from 'mailparser';

import { ImapHandleErrorService } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-handle-error.service';

export type MessageFetchResult = {
  uid: number;
  parsed: ParsedMail | null;
  processingTimeMs?: number;
};

@Injectable()
export class ImapMessageProcessorService {
  private readonly logger = new Logger(ImapMessageProcessorService.name);

  constructor(
    private readonly imapHandleErrorService: ImapHandleErrorService,
  ) {}

  async processMessagesByUidsInFolder(
    uids: number[],
    folder: string,
    client: ImapFlow,
  ): Promise<MessageFetchResult[]> {
    if (!uids.length) {
      return [];
    }

    try {
      const lock = await client.getMailboxLock(folder);

      try {
        return await this.fetchMessages(uids, client);
      } finally {
        lock.release();
      }
    } catch (error) {
      this.logger.error(
        `Failed to fetch messages from folder ${folder}: ${error.message}`,
      );

      return uids.map((uid) =>
        this.createErrorResult(uid, error as Error, Date.now()),
      );
    }
  }

  private async fetchMessages(
    uids: number[],
    client: ImapFlow,
  ): Promise<MessageFetchResult[]> {
    const startTime = Date.now();
    const results: MessageFetchResult[] = [];

    try {
      const uidSet = uids.join(',');

      const fetchResults = client.fetch(
        uidSet,
        {
          uid: true,
          source: true,
        },
        { uid: true },
      );

      const messagesData = new Map<number, FetchMessageObject>();

      for await (const message of fetchResults) {
        messagesData.set(message.uid, message);
      }

      for (const uid of uids) {
        const messageData = messagesData.get(uid);

        if (messageData) {
          const result = await this.processMessageData(
            uid,
            messageData,
            startTime,
          );

          results.push(result);
        } else {
          results.push({
            uid,
            parsed: null,
            processingTimeMs: Date.now() - startTime,
          });
        }
      }
    } catch (error) {
      this.logger.error(`Batch fetch failed: ${error.message}`);

      return uids.map((uid) =>
        this.createErrorResult(uid, error as Error, startTime),
      );
    }

    return results;
  }

  private async processMessageData(
    uid: number,
    messageData: FetchMessageObject,
    startTime: number,
  ): Promise<MessageFetchResult> {
    try {
      const rawContent = messageData.source?.toString() || '';

      if (!rawContent) {
        this.logger.debug(`No source content for message UID ${uid}`);

        return {
          uid,
          parsed: null,
          processingTimeMs: Date.now() - startTime,
        };
      }

      const parsed = await this.parseMessage(rawContent, uid);
      const processingTime = Date.now() - startTime;

      this.logger.debug(`Processed message UID ${uid} in ${processingTime}ms`);

      return {
        uid,
        parsed,
        processingTimeMs: processingTime,
      };
    } catch (error) {
      return this.createErrorResult(uid, error as Error, startTime);
    }
  }

  private async parseMessage(
    rawContent: string,
    uid: number,
  ): Promise<ParsedMail> {
    try {
      return await simpleParser(rawContent);
    } catch (error) {
      this.logger.error(`Failed to parse message UID ${uid}: ${error.message}`);
      throw error;
    }
  }

  createErrorResult(
    uid: number,
    error: Error,
    startTime: number,
  ): MessageFetchResult {
    const processingTime = Date.now() - startTime;

    this.logger.error(`Failed to fetch message UID ${uid}: ${error.message}`);

    return {
      uid,
      parsed: null,
      processingTimeMs: processingTime,
    };
  }

  createErrorResults(
    uids: number[],
    folder: string,
    error: Error,
  ): MessageFetchResult[] {
    return uids.map((uid) => {
      this.logger.error(`Failed to fetch message UID ${uid}: ${error.message}`);

      this.imapHandleErrorService.handleImapMessagesImportError(
        error,
        `${folder}:${uid}`,
      );

      return {
        uid,
        parsed: null,
      };
    });
  }
}
