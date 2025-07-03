import { Injectable, Logger } from '@nestjs/common';

import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import {
  MessageImportDriverException,
  MessageImportDriverExceptionCode,
} from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';
import { MicrosoftClientProvider } from 'src/modules/messaging/message-import-manager/drivers/microsoft/providers/microsoft-client.provider';
import { MicrosoftGraphBatchResponse } from 'src/modules/messaging/message-import-manager/drivers/microsoft/services/microsoft-get-messages.interface';
import { MicrosoftHandleErrorService } from 'src/modules/messaging/message-import-manager/drivers/microsoft/services/microsoft-handle-error.service';
import { isAccessTokenRefreshingError } from 'src/modules/messaging/message-import-manager/drivers/microsoft/utils/is-access-token-refreshing-error.utils';

@Injectable()
export class MicrosoftFetchByBatchService {
  private readonly logger = new Logger(MicrosoftFetchByBatchService.name);
  constructor(
    private readonly microsoftClientProvider: MicrosoftClientProvider,
    private readonly microsoftHandleErrorService: MicrosoftHandleErrorService,
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

      try {
        const batchResponse = await client
          .api('/$batch')
          .post({ requests: batchRequests });

        batchResponses.push(batchResponse);
      } catch (error) {
        if (isAccessTokenRefreshingError(error?.body)) {
          throw new MessageImportDriverException(
            error.message,
            MessageImportDriverExceptionCode.CLIENT_NOT_AVAILABLE,
          );
        }
        this.microsoftHandleErrorService.handleMicrosoftMessageFetchByBatchError(
          error,
        );
      }
    }

    return {
      messageIdsByBatch,
      batchResponses,
    };
  }

  /**
   * Microsoft client.api.post sometimes throws (hard to catch) temporary errors like this one:
   *
   * {
   *   statusCode: 200,
   *   code: "SyntaxError",
   *   requestId: null,
   *   date: "2025-05-14T11:43:02.024Z",
   *   body: "SyntaxError: Unexpected token < in JSON at position 19341",
   *   headers: {
   *   },
   * }
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private isTemporaryError(error: any): boolean {
    return error?.body?.includes('Unexpected token < in JSON at position');
  }
}
