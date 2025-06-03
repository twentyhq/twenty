import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { MessageDirection } from 'src/modules/messaging/common/enums/message-direction.enum';
import { computeMessageDirection } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/compute-message-direction.util';
import { MicrosoftImportDriverException } from 'src/modules/messaging/message-import-manager/drivers/microsoft/exceptions/microsoft-import-driver.exception';
import { MicrosoftGraphBatchResponse } from 'src/modules/messaging/message-import-manager/drivers/microsoft/services/microsoft-get-messages.interface';
import { MessageWithParticipants } from 'src/modules/messaging/message-import-manager/types/message';
import { formatAddressObjectAsParticipants } from 'src/modules/messaging/message-import-manager/utils/format-address-object-as-participants.util';
import { safeParseAddress } from 'src/modules/messaging/message-import-manager/utils/safe-parse.util';

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
  ): Promise<MessageWithParticipants[]> {
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

      return messages;
    } catch (error) {
      this.microsoftHandleErrorService.handleMicrosoftGetMessagesError(error);

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
        throw new MicrosoftImportDriverException(
          response.error.message,
          response.error.code,
          response.error.statusCode,
        );
      }

      const safeParseAddressFrom = response?.from?.emailAddress
        ? [
            {
              address: safeParseAddress(response.from.emailAddress) || '',
              name: response.from.emailAddress.name,
            },
          ]
        : [];

      const safeParseAddressTo = response?.toRecipients
        ?.filter(isDefined)
        // @ts-expect-error legacy noImplicitAny
        .map((recipient) => safeParseAddress(recipient.emailAddress));

      const safeParseAddressCc = response?.ccRecipients
        ?.filter(isDefined)
        // @ts-expect-error legacy noImplicitAny
        .map((recipient) => safeParseAddress(recipient.emailAddress));

      const safeParseAddressBcc = response?.bccRecipients
        ?.filter(isDefined)
        // @ts-expect-error legacy noImplicitAny
        .map((recipient) => safeParseAddress(recipient.emailAddress));

      const participants = [
        ...(safeParseAddressFrom
          ? formatAddressObjectAsParticipants(safeParseAddressFrom, 'from')
          : []),
        ...(safeParseAddressTo
          ? formatAddressObjectAsParticipants(safeParseAddressTo, 'to')
          : []),
        ...(safeParseAddressCc
          ? formatAddressObjectAsParticipants(safeParseAddressCc, 'cc')
          : []),
        ...(safeParseAddressBcc
          ? formatAddressObjectAsParticipants(safeParseAddressBcc, 'bcc')
          : []),
      ];

      return {
        externalId: response.id,
        subject: response.subject || '',
        receivedAt: new Date(response.receivedDateTime),
        text:
          response.body?.contentType === 'text' ? response.body?.content : '',
        headerMessageId: response.internetMessageId,
        messageThreadExternalId: response.conversationId,
        direction: response.from
          ? computeMessageDirection(
              response.from.emailAddress.address,
              connectedAccount,
            )
          : MessageDirection.INCOMING,
        participants,
        attachments: [],
      };
    });

    return messages.filter(isDefined);
  }

  private parseBatchResponse(batchResponse: MicrosoftGraphBatchResponse) {
    if (!batchResponse?.responses) {
      return [];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return batchResponse.responses.map((response: any) => {
      if (response.status === 200) {
        return response.body;
      }

      if (response.status !== 503 && response.status !== 429) {
        this.logger.error(`Microsoft parseBatchResponse error`, response);
      }

      const errorParsed = response?.body?.error
        ? response.body.error
        : {
            message:
              'Microsoft parseBatchResponse error: no response.body.error',
          };

      return {
        error: {
          ...errorParsed,
          statusCode: response?.status,
        },
      };
    });
  }
}
