import { Injectable, Logger } from '@nestjs/common';

import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { ImapClientProvider } from 'src/modules/messaging/message-import-manager/drivers/imap/providers/imap-client.provider';
import { ImapMessageLocatorService } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-message-locator.service';
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

  constructor(
    private readonly imapClientProvider: ImapClientProvider,
    private readonly imapMessageLocatorService: ImapMessageLocatorService,
    private readonly imapMessageProcessorService: ImapMessageProcessorService,
  ) {}

  async fetchAllByBatches(
    messageIds: string[],
    connectedAccount: ConnectedAccount,
  ): Promise<FetchAllResult> {
    const batchLimit = 20;
    const batchResults: MessageFetchResult[][] = [];
    const messageIdsByBatch: string[][] = [];

    this.logger.log(
      `Starting optimized batch fetch for ${messageIds.length} messages`,
    );

    const client = await this.imapClientProvider.getClient(connectedAccount);

    try {
      const messageLocations =
        await this.imapMessageLocatorService.locateAllMessages(
          messageIds,
          client,
        );

      for (let i = 0; i < messageIds.length; i += batchLimit) {
        const batchMessageIds = messageIds.slice(i, i + batchLimit);

        messageIdsByBatch.push(batchMessageIds);

        try {
          const batchResult =
            await this.imapMessageProcessorService.processMessagesByIds(
              batchMessageIds,
              messageLocations,
              client,
            );

          batchResults.push(batchResult);

          this.logger.log(
            `Fetched batch ${Math.floor(i / batchLimit) + 1}/${Math.ceil(messageIds.length / batchLimit)} (${batchMessageIds.length} messages)`,
          );
        } catch (error) {
          this.logger.error(
            `Batch fetch failed for batch starting at index ${i}: ${error.message}`,
          );

          const errorResults =
            this.imapMessageProcessorService.createErrorResults(
              batchMessageIds,
              error as Error,
            );

          batchResults.push(errorResults);
        }
      }

      return {
        messageIdsByBatch,
        batchResults,
      };
    } finally {
      if (client) {
        await this.imapClientProvider.closeClient(client);
      }
    }
  }
}
