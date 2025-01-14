import { Injectable } from '@nestjs/common';

import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { MicrosoftClientProvider } from 'src/modules/messaging/message-import-manager/drivers/microsoft/providers/microsoft-client.provider';
import { MicrosoftGraphBatchResponse } from 'src/modules/messaging/message-import-manager/drivers/microsoft/services/microsoft-get-messages.interface';

@Injectable()
export class MicrosoftFetchByBatchService {
  constructor(
    private readonly microsoftClientProvider: MicrosoftClientProvider,
  ) {}

  async fetchAllByBatches(
    messageIds: string[],
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'refreshToken' | 'id'
    >,
  ): Promise<{
    messageIdsByBatch: string[][];
    batchResponses: MicrosoftGraphBatchResponse[];
  }> {
    const batchLimit = 20;
    const batchResponses: MicrosoftGraphBatchResponse[] = [];
    const messageIdsByBatch: string[][] = [];

    const client =
      await this.microsoftClientProvider.getMicrosoftClient(connectedAccount);

    for (let i = 0; i < messageIds.length; i += batchLimit) {
      const batchMessageIds = messageIds.slice(i, i + batchLimit);

      messageIdsByBatch.push(batchMessageIds);

      const batchRequests = batchMessageIds.map((messageId, index) => ({
        id: (index + 1).toString(),
        method: 'GET',
        url: `/me/messages/${messageId}`,
        headers: {
          'Content-Type': 'application/json',
          Prefer: 'outlook.body-content-type="text"',
        },
      }));

      const batchResponse = await client
        .api('/$batch')
        .post({ requests: batchRequests });

      batchResponses.push(batchResponse);
    }

    return {
      messageIdsByBatch,
      batchResponses,
    };
  }
}
