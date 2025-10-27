import { Injectable } from '@nestjs/common';

import { type AxiosResponse } from 'axios';
import { type gmail_v1 as gmailV1 } from 'googleapis';
import { isDefined } from 'twenty-shared/utils';

import { OAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/services/oauth2-client-manager.service';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import {
  MessageImportDriverException,
  MessageImportDriverExceptionCode,
} from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';
import { GmailFetchByBatchService } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/gmail-fetch-by-batch.service';
import { GmailHandleErrorService } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/gmail-handle-error.service';
import { parseAndFormatGmailMessage } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/parse-and-format-gmail-message.util';
import { type MessageWithParticipants } from 'src/modules/messaging/message-import-manager/types/message';

@Injectable()
export class GmailGetMessagesService {
  constructor(
    private readonly fetchByBatchesService: GmailFetchByBatchService,
    private readonly gmailHandleErrorService: GmailHandleErrorService,
    private readonly oAuth2ClientManagerService: OAuth2ClientManagerService,
  ) {}

  async getMessages(
    messageIds: string[],
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'provider' | 'refreshToken' | 'id' | 'handle' | 'handleAliases'
    >,
  ): Promise<MessageWithParticipants[]> {
    const oAuth2Client =
      await this.oAuth2ClientManagerService.getGoogleOAuth2Client(
        connectedAccount,
      );

    const accessToken = await oAuth2Client.auth.getAccessToken();

    if (!isDefined(accessToken)) {
      throw new MessageImportDriverException(
        `Error getting google access token for connected account ${connectedAccount.id}`,
        MessageImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
      );
    }

    const { messageIdsByBatch, batchResponses } =
      await this.fetchByBatchesService.fetchAllByBatches(
        messageIds,
        accessToken,
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
