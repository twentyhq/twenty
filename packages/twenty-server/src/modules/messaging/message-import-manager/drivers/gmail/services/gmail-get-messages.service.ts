import { Injectable } from '@nestjs/common';

import { type AxiosResponse } from 'axios';
import { type gmail_v1 as gmailV1 } from 'googleapis';
import { isDefined } from 'twenty-shared/utils';

import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import {
  MessageImportDriverException,
  MessageImportDriverExceptionCode,
} from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';
import { GmailFetchByBatchService } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/gmail-fetch-by-batch.service';
import { GmailMessagesImportErrorHandler } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/gmail-messages-import-error-handler.service';
import { parseAndFormatGmailMessage } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/parse-and-format-gmail-message.util';
import { type MessageWithParticipants } from 'src/modules/messaging/message-import-manager/types/message';

@Injectable()
export class GmailGetMessagesService {
  constructor(
    private readonly fetchByBatchesService: GmailFetchByBatchService,
    private readonly gmailMessagesImportErrorHandler: GmailMessagesImportErrorHandler,
  ) {}

  async getMessages(
    messageIds: string[],
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'accessToken' | 'id' | 'handle' | 'handleAliases'
    >,
  ): Promise<MessageWithParticipants[]> {
    if (!isDefined(connectedAccount.accessToken)) {
      throw new MessageImportDriverException(
        'Access token is required',
        MessageImportDriverExceptionCode.ACCESS_TOKEN_MISSING,
      );
    }
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
        this.gmailMessagesImportErrorHandler.handleError(
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
