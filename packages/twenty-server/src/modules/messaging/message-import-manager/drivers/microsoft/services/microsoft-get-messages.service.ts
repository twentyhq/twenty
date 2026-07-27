import { Injectable, Logger } from '@nestjs/common';

import { type EmailAddress } from 'addressparser';
import { MessageParticipantRole } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { MessageDirection } from 'src/modules/messaging/common/enums/message-direction.enum';
import { computeMessageDirection } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/compute-message-direction.util';
import { MicrosoftImportDriverException } from 'src/modules/messaging/message-import-manager/drivers/microsoft/exceptions/microsoft-import-driver.exception';
import { type MicrosoftGraphBatchResponse } from 'src/modules/messaging/message-import-manager/drivers/microsoft/services/microsoft-get-messages.interface';
import { type MessageWithParticipants } from 'src/modules/messaging/message-import-manager/types/message';
import { buildReplyToParticipants } from 'src/modules/messaging/message-import-manager/utils/build-reply-to-participants.util';
import { extractMessageBodyText } from 'src/modules/messaging/message-import-manager/utils/extract-message-body-text.util';
import { formatAddressObjectAsParticipants } from 'src/modules/messaging/message-import-manager/utils/format-address-object-as-participants.util';
import { safeParseEmailAddress } from 'src/modules/messaging/message-import-manager/utils/safe-parse-email-address.util';

import { MicrosoftFetchByBatchService } from './microsoft-fetch-by-batch.service';
import { MicrosoftMessagesImportErrorHandler } from './microsoft-messages-import-error-handler.service';

type ConnectedAccountType = Pick<
  ConnectedAccountEntity,
  'id' | 'provider' | 'handle' | 'handleAliases'
>;

@Injectable()
export class MicrosoftGetMessagesService {
  private readonly logger = new Logger(MicrosoftGetMessagesService.name);

  constructor(
    private readonly microsoftFetchByBatchService: MicrosoftFetchByBatchService,
    private readonly microsoftMessagesImportErrorHandler: MicrosoftMessagesImportErrorHandler,
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
      this.microsoftMessagesImportErrorHandler.handleError(error);

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

      const safeParseFrom = response?.from?.emailAddress
        ? [safeParseEmailAddress(response.from.emailAddress)]
        : [];

      const safeParseReplyTo = response?.replyTo
        ?.filter(isDefined)
        .map((recipient: { emailAddress: EmailAddress }) =>
          safeParseEmailAddress(recipient.emailAddress),
        );

      const safeParseTo = response?.toRecipients
        ?.filter(isDefined)
        .map((recipient: { emailAddress: EmailAddress }) =>
          safeParseEmailAddress(recipient.emailAddress),
        );

      const safeParseCc = response?.ccRecipients
        ?.filter(isDefined)
        .map((recipient: { emailAddress: EmailAddress }) =>
          safeParseEmailAddress(recipient.emailAddress),
        );

      const safeParseBcc = response?.bccRecipients
        ?.filter(isDefined)
        .map((recipient: { emailAddress: EmailAddress }) =>
          safeParseEmailAddress(recipient.emailAddress),
        );

      const participants = [
        ...(safeParseFrom
          ? formatAddressObjectAsParticipants(
              safeParseFrom,
              MessageParticipantRole.FROM,
            )
          : []),
        ...buildReplyToParticipants(safeParseReplyTo, safeParseFrom[0]),
        ...(safeParseTo
          ? formatAddressObjectAsParticipants(
              safeParseTo,
              MessageParticipantRole.TO,
            )
          : []),
        ...(safeParseCc
          ? formatAddressObjectAsParticipants(
              safeParseCc,
              MessageParticipantRole.CC,
            )
          : []),
        ...(safeParseBcc
          ? formatAddressObjectAsParticipants(
              safeParseBcc,
              MessageParticipantRole.BCC,
            )
          : []),
      ];

      const text = extractMessageBodyText(
        response.body?.contentType === 'text'
          ? { text: response.body?.content }
          : { html: response.body?.content },
      );

      return {
        externalId: response.id,
        subject: response.subject || '',
        receivedAt: new Date(response.receivedDateTime),
        text,
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
        messageFolderExternalIds: response.parentFolderId
          ? [response.parentFolderId]
          : [],
        isDraft: response.isDraft ?? false,
        messageHeaders: response.internetMessageHeaders ?? [],
      };
    });

    return messages.filter(isDefined);
  }

  private parseBatchResponse(batchResponse: MicrosoftGraphBatchResponse) {
    if (!batchResponse?.responses) {
      return [];
    }

    // oxlint-disable-next-line typescript/no-explicit-any
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
