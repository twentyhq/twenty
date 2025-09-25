import { Injectable, Logger } from '@nestjs/common';

import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { ImapClientProvider } from 'src/modules/messaging/message-import-manager/drivers/imap/providers/imap-client.provider';
import {
  ImapMessageProcessorService,
  type MessageFetchResult,
} from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-message-processor.service';

type ConnectedAccount = Pick<
  ConnectedAccountWorkspaceEntity,
  'id' | 'provider' | 'handle' | 'handleAliases' | 'connectionParameters'
>;

type FetchAllResult = {
  results: MessageFetchResult[];
};

@Injectable()
export class ImapFetchByBatchService {
  private readonly logger = new Logger(ImapFetchByBatchService.name);

  constructor(
    private readonly imapClientProvider: ImapClientProvider,
    private readonly imapMessageProcessorService: ImapMessageProcessorService,
  ) {}

  async fetchAllByBatches(
    uids: number[],
    connectedAccount: ConnectedAccount,
    folder: string,
  ): Promise<FetchAllResult> {
    const batchLimit = 20;
    const results: MessageFetchResult[] = [];

    this.logger.log(
      `Starting optimized batch fetch for ${uids.length} messages from folder ${folder}`,
    );

    const client = await this.imapClientProvider.getClient(connectedAccount);

    try {
      for (let i = 0; i < uids.length; i += batchLimit) {
        const batchUids = uids.slice(i, i + batchLimit);

        try {
          const batchResult =
            await this.imapMessageProcessorService.processMessagesByUidsInFolder(
              batchUids,
              folder,
              client,
            );

          results.push(...batchResult);

          this.logger.log(
            `Fetched batch ${Math.floor(i / batchLimit) + 1}/${Math.ceil(uids.length / batchLimit)} (${batchUids.length} messages)`,
          );
        } catch (error) {
          this.logger.error(
            `Batch fetch failed for batch starting at index ${i}: ${error.message}`,
          );

          const errorResults =
            this.imapMessageProcessorService.createErrorResults(
              batchUids,
              folder,
              error as Error,
            );

          results.push(...errorResults);
        }
      }

      return { results };
    } finally {
      if (client) {
        await this.imapClientProvider.closeClient(client);
      }
    }
  }
}
