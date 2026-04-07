import { Injectable } from '@nestjs/common';

import { OAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/services/oauth2-client-manager.service';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { type MicrosoftGraphBatchResponse } from 'src/modules/messaging/message-import-manager/drivers/microsoft/services/microsoft-get-messages.interface';

@Injectable()
export class MicrosoftFetchByBatchService {
  constructor(
    private readonly oAuth2ClientManagerService: OAuth2ClientManagerService,
  ) {}

  async fetchAllByBatches(
    messageIds: string[],
    connectedAccount: Pick<
      ConnectedAccountEntity,
      'accessToken' | 'refreshToken' | 'id' | 'provider'
    >,
  ): Promise<{
    messageIdsByBatch: string[][];
    batchResponses: MicrosoftGraphBatchResponse[];
  }> {
    const batchLimit = 20;
    const batchResponses: MicrosoftGraphBatchResponse[] = [];
    const messageIdsByBatch: string[][] = [];

    const client =
      await this.oAuth2ClientManagerService.getMicrosoftOAuth2Client(
        connectedAccount,
      );

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
