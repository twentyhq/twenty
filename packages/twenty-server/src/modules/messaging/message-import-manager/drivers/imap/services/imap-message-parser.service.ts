import { Injectable, Logger } from '@nestjs/common';

import { type FetchMessageObject, type ImapFlow } from 'imapflow';
import { chunk } from 'lodash';
import PostalMime, { type Email as ParsedEmail } from 'postal-mime';

export type MessageParseResult = {
  uid: number;
  parsed: ParsedEmail | null;
  error?: Error;
};

export type FolderParseResult = {
  messages: MessageParseResult[];
  uidValidity: bigint | null;
};

@Injectable()
export class ImapMessageParserService {
  private readonly logger = new Logger(ImapMessageParserService.name);
  private readonly BATCH_SIZE = 10;

  async parseMessagesFromFolder(
    messageUids: number[],
    folderPath: string,
    client: ImapFlow,
  ): Promise<FolderParseResult> {
    if (!messageUids.length) {
      return { messages: [], uidValidity: null };
    }

    const lock = await client.getMailboxLock(folderPath);

    try {
      const uidValidity =
        client.mailbox && typeof client.mailbox !== 'boolean'
          ? client.mailbox.uidValidity
          : null;

      const startTime = Date.now();
      const results: MessageParseResult[] = [];
      const fetchedUids = new Set<number>();

      const batches = chunk(messageUids, this.BATCH_SIZE);

      for (const batch of batches) {
        const uidSet = batch.join(',');

        this.logger.debug(
          `Fetching batch of ${batch.length} messages from ${folderPath}`,
        );

        const messages = await client.fetchAll(
          uidSet,
          { uid: true, source: true },
          { uid: true },
        );

        for (const message of messages) {
          fetchedUids.add(message.uid);
          results.push(await this.parseMessage(message));
        }
      }

      for (const uid of messageUids) {
        if (!fetchedUids.has(uid)) {
          results.push({ uid, parsed: null });
        }
      }

      this.logger.log(
        `Fetched and parsed ${results.length} messages from ${folderPath} in ${Date.now() - startTime}ms`,
      );

      return { messages: results, uidValidity };
    } catch (error) {
      this.logger.error(
        `Failed to parse messages from folder ${folderPath}: ${error.message}`,
      );

      return {
        messages: this.createErrorResults(messageUids, error as Error),
        uidValidity: null,
      };
    } finally {
      lock.release();
    }
  }

  private async parseMessage(
    message: FetchMessageObject,
  ): Promise<MessageParseResult> {
    const { uid, source } = message;

    if (!source) {
      this.logger.debug(`No source content for message UID ${uid}`);

      return { uid, parsed: null };
    }

    try {
      const parsed = await PostalMime.parse(source);

      return { uid, parsed };
    } catch (error) {
      this.logger.error(`Failed to parse message UID ${uid}: ${error.message}`);

      return { uid, parsed: null, error: error as Error };
    }
  }

  createErrorResults(
    messageUids: number[],
    error: Error,
  ): MessageParseResult[] {
    return messageUids.map((uid) => ({ uid, parsed: null, error }));
  }
}
