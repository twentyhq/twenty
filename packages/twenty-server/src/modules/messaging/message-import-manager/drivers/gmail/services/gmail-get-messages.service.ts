import { Injectable } from '@nestjs/common';

import { AxiosResponse } from 'axios';
import { gmail_v1 as gmailV1 } from 'googleapis';
import { isDefined } from 'twenty-shared/utils';

import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { GmailFetchByBatchService } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/gmail-fetch-by-batch.service';
import { GmailHandleErrorService } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/gmail-handle-error.service';
import { parseAndFormatGmailMessage } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/parse-and-format-gmail-message.util';
import { MessageWithParticipants } from 'src/modules/messaging/message-import-manager/types/message';

@Injectable()
export class GmailGetMessagesService {
  constructor(
    private readonly fetchByBatchesService: GmailFetchByBatchService,
    private readonly gmailHandleErrorService: GmailHandleErrorService,
  ) {}

  async getMessages(
    messageIds: string[],
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'accessToken' | 'refreshToken' | 'id' | 'handle' | 'handleAliases'
    >,
  ): Promise<MessageWithParticipants[]> {
    const { messageIdsByBatch, batchResponses } =
      await this.fetchByBatchesService.fetchAllByBatches(
        messageIds,
        connectedAccount.accessToken,
        'batch_gmail_messages',
      );

    const messages = batchResponses.flatMap((response, index) => {
      return this.formatBatchResponseAsMessage(
        messageIdsByBatch[index],
        response,
        connectedAccount,
      );
    });

    return messages;
  }

  private formatBatchResponseAsMessage(
    messageIds: string[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    responseCollection: AxiosResponse<any, any>,
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'handle' | 'handleAliases'
    >,
  ): MessageWithParticipants[] {
    const parsedResponses =
      this.fetchByBatchesService.parseBatch(responseCollection);

    const messages = parsedResponses.map((response, index) => {
      if ('error' in response) {
        this.gmailHandleErrorService.handleGmailMessagesImportError(
          response.error,
          messageIds[index],
        );

        return undefined;
      }

      return parseAndFormatGmailMessage(
        response as gmailV1.Schema$Message,
        connectedAccount,
      );
    });

    return messages.filter(isDefined);
  }
}
