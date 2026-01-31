import { Injectable, Logger } from '@nestjs/common';

import { type FetchMessageObject, type ImapFlow } from 'imapflow';
import PostalMime, { type Email as ParsedEmail } from 'postal-mime';

export type MessageParseResult = {
  uid: number;
  parsed: ParsedEmail | null;
  error?: Error;
};

@Injectable()
export class ImapMessageParserService {
  private readonly logger = new Logger(ImapMessageParserService.name);

  async parseMessagesFromFolder(
    messageUids: number[],
    folderPath: string,
    client: ImapFlow,
  ): Promise<MessageParseResult[]> {
    if (!messageUids.length) {
      return [];
    }

    const lock = await client.getMailboxLock(folderPath);
    const results: MessageParseResult[] = [];
    const CHUNK_SIZE = 10; // "Advanced" Safety: Process small batches to avoid OOM

    try {
      const startTime = Date.now();

      // Chunk the UIDs
      for (let i = 0; i < messageUids.length; i += CHUNK_SIZE) {
        const chunk = messageUids.slice(i, i + CHUNK_SIZE);
        const uidSet = chunk.join(',');

        try {
          // Fetch only this chunk
          const messages = await client.fetchAll(
            uidSet,
            { uid: true, source: true },
            { uid: true },
          );

          for (const message of messages) {
            results.push(await this.parseMessage(message));
          }
        } catch (chunkError) {
          this.logger.error(`Failed to fetch chunk ${uidSet}: ${chunkError.message}`);
          // Add error results for this chunk so we don't return 'missing'
          results.push(...this.createErrorResults(chunk, chunkError as Error));
        }
      }

      // Check for missing UIDs (skips)
      const fetchedUids = new Set(results.map(r => r.uid));
      for (const uid of messageUids) {
        if (!fetchedUids.has(uid)) {
          results.push({ uid, parsed: null, error: new Error('Message not returned by server') });
        }
      }

      this.logger.log(
        `Fetched and parsed ${results.length} messages from ${folderPath} in ${Date.now() - startTime}ms (Chunked)`,
      );

      return results;
    } catch (error) {
      this.logger.error(
        `Failed to parse messages from folder ${folderPath}: ${error.message}`,
      );

      return this.createErrorResults(messageUids, error as Error);
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
