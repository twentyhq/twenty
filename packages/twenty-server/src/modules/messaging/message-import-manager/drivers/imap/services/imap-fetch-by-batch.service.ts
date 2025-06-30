import { Injectable, Logger } from '@nestjs/common';

import { ImapFlow } from 'imapflow';

import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { ImapClientProvider } from 'src/modules/messaging/message-import-manager/drivers/imap/providers/imap-client.provider';
import {
  ImapMessageLocatorService,
  MessageLocation,
} from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-message-locator.service';
import {
  ImapMessageProcessorService,
  MessageFetchResult,
} from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-message-processor.service';

type ConnectedAccount = Pick<
  ConnectedAccountWorkspaceEntity,
  'id' | 'provider' | 'handle' | 'handleAliases' | 'connectionParameters'
>;

type FetchAllResult = {
  messageIdsByBatch: string[][];
  batchResults: MessageFetchResult[][];
};

@Injectable()
export class ImapFetchByBatchService {
  private readonly logger = new Logger(ImapFetchByBatchService.name);

  private static readonly RETRY_ATTEMPTS = 2;
  private static readonly RETRY_DELAY_MS = 1000;
  private static readonly BATCH_LIMIT = 20;

  constructor(
    private readonly imapClientProvider: ImapClientProvider,
    private readonly imapMessageLocatorService: ImapMessageLocatorService,
    private readonly imapMessageProcessorService: ImapMessageProcessorService,
  ) {}

  async fetchAllByBatches(
    messageIds: string[],
    connectedAccount: ConnectedAccount,
  ): Promise<FetchAllResult> {
    const batchResults: MessageFetchResult[][] = [];
    const messageIdsByBatch: string[][] = [];

    this.logger.log(
      `Starting optimized batch fetch for ${messageIds.length} messages`,
    );

    let client: ImapFlow | null = null;

    try {
      client = await this.imapClientProvider.getClient(connectedAccount);

      const messageLocations =
        await this.imapMessageLocatorService.locateAllMessages(
          messageIds,
          client,
        );

      const batches = this.chunkArray(
        messageIds,
        ImapFetchByBatchService.BATCH_LIMIT,
      );

      let processedCount = 0;

      for (const batch of batches) {
        const batchResult = await this.fetchBatchWithRetry(
          batch,
          messageLocations,
          client,
        );

        batchResults.push(batchResult);
        messageIdsByBatch.push(batch);

        processedCount += batch.length;
        this.logger.log(
          `Fetched ${processedCount}/${messageIds.length} messages`,
        );
      }

      return { messageIdsByBatch, batchResults };
    } finally {
      if (client) {
        await this.imapClientProvider.closeClient(connectedAccount.id);
      }
    }
  }

  private async fetchBatchWithRetry(
    messageIds: string[],
    messageLocations: Map<string, MessageLocation>,
    client: ImapFlow,
    attempt = 1,
  ): Promise<MessageFetchResult[]> {
    try {
      return await this.imapMessageProcessorService.processMessagesByIds(
        messageIds,
        messageLocations,
        client,
      );
    } catch (error) {
      if (attempt < ImapFetchByBatchService.RETRY_ATTEMPTS) {
        const delay = ImapFetchByBatchService.RETRY_DELAY_MS * attempt;

        this.logger.warn(
          `Batch fetch attempt ${attempt} failed, retrying in ${delay}ms: ${error.message}`,
        );

        await this.delay(delay);

        return this.fetchBatchWithRetry(
          messageIds,
          messageLocations,
          client,
          attempt + 1,
        );
      }

      this.logger.error(
        `Batch fetch failed after ${ImapFetchByBatchService.RETRY_ATTEMPTS} attempts: ${error.message}`,
      );

      return this.imapMessageProcessorService.createErrorResults(
        messageIds,
        error as Error,
      );
    }
  }

  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];

    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }

    return chunks;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
