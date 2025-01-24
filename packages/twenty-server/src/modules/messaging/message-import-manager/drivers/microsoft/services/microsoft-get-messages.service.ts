import { Injectable, Logger } from '@nestjs/common';

import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { computeMessageDirection } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/compute-message-direction.util';
import { MicrosoftGraphBatchResponse } from 'src/modules/messaging/message-import-manager/drivers/microsoft/services/microsoft-get-messages.interface';
import { MessageWithParticipants } from 'src/modules/messaging/message-import-manager/types/message';
import { formatAddressObjectAsParticipants } from 'src/modules/messaging/message-import-manager/utils/format-address-object-as-participants.util';
import { isDefined } from 'src/utils/is-defined';

import { MicrosoftFetchByBatchService } from './microsoft-fetch-by-batch.service';
import { MicrosoftHandleErrorService } from './microsoft-handle-error.service';

type ConnectedAccountType = Pick<
  ConnectedAccountWorkspaceEntity,
  'refreshToken' | 'id' | 'provider' | 'handle' | 'handleAliases'
>;

@Injectable()
export class MicrosoftGetMessagesService {
  private readonly logger = new Logger(MicrosoftGetMessagesService.name);

  constructor(
    private readonly microsoftFetchByBatchService: MicrosoftFetchByBatchService,
    private readonly microsoftHandleErrorService: MicrosoftHandleErrorService,
  ) {}

  async getMessages(
    messageIds: string[],
    connectedAccount: ConnectedAccountType,
    workspaceId: string,
  ): Promise<MessageWithParticipants[]> {
    const startTime = Date.now();

    try {
      const { batchResponses } =
        await this.microsoftFetchByBatchService.fetchAllByBatches(
          messageIds,
          connectedAccount,
        );

      const messages = this.formatBatchResponsesAsMessages(
        batchResponses,
        connectedAccount,
      );

      const endTime = Date.now();

      this.logger.log(
        `Messaging import for workspace ${workspaceId} and account ${
          connectedAccount.id
        } fetched ${messages.length} messages in ${endTime - startTime}ms`,
      );

      return messages;
    } catch (error) {
      this.microsoftHandleErrorService.handleMicrosoftMessageFetchError(error);

      return [];
    }
  }

  public formatBatchResponsesAsMessages(
    batchResponses: MicrosoftGraphBatchResponse[],
    connectedAccount: ConnectedAccountType,
  ): MessageWithParticipants[] {
    return batchResponses.flatMap((batchResponse) => {
      return this.formatBatchResponseAsMessages(
        batchResponse,
        connectedAccount,
      );
    });
  }

  private formatBatchResponseAsMessages(
    batchResponse: MicrosoftGraphBatchResponse,
    connectedAccount: ConnectedAccountType,
  ): MessageWithParticipants[] {
    const parsedResponses = this.parseBatchResponse(batchResponse);

    const messages = parsedResponses.map((response) => {
      if ('error' in response) {
        this.microsoftHandleErrorService.handleMicrosoftMessageFetchError(
          response.error,
        );
      }

      const participants = [
        ...formatAddressObjectAsParticipants(
          response?.from?.emailAddress,
          'from',
        ),
        ...formatAddressObjectAsParticipants(
          response?.toRecipients?.map((recipient) => recipient.emailAddress),
          'to',
        ),
        ...formatAddressObjectAsParticipants(
          response?.ccRecipients?.map((recipient) => recipient.emailAddress),
          'cc',
        ),
        ...formatAddressObjectAsParticipants(
          response?.bccRecipients?.map((recipient) => recipient.emailAddress),
          'bcc',
        ),
      ];

      return {
        externalId: response.id,
        subject: response.subject || '',
        receivedAt: new Date(response.receivedDateTime),
        text:
          response.body?.contentType === 'text' ? response.body?.content : '',
        headerMessageId: response.internetMessageId,
        messageThreadExternalId: response.conversationId,
        direction: computeMessageDirection(
          response.from.emailAddress.address,
          connectedAccount,
        ),
        participants: participants,
        attachments: [],
      };
    });

    return messages.filter(isDefined);
  }

  private parseBatchResponse(batchResponse: MicrosoftGraphBatchResponse) {
    if (!batchResponse?.responses) {
      return [];
    }

    return batchResponse.responses.map((response: any) => {
      if (response.status === 200) {
        return response.body;
      }

      return { error: response.error };
    });
  }
}
