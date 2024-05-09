import { Injectable, Logger } from '@nestjs/common';

import { AxiosResponse } from 'axios';
import planer from 'planer';
import addressparser from 'addressparser';

import { GmailMessage } from 'src/modules/messaging/types/gmail-message';
import { MessageQuery } from 'src/modules/messaging/types/message-or-thread-query';
import { FetchByBatchesService } from 'src/modules/messaging/services/fetch-by-batch/fetch-by-batch.service';
import { formatAddressObjectAsParticipants } from 'src/modules/messaging/services/utils/format-address-object-as-participants.util';
import { assert, assertNotNull } from 'src/utils/assert';
import { GmailMessageParsedResponse } from 'src/modules/messaging/types/gmail-message-parsed-response';

@Injectable()
export class FetchMessagesByBatchesService {
  private readonly logger = new Logger(FetchMessagesByBatchesService.name);

  constructor(private readonly fetchByBatchesService: FetchByBatchesService) {}

  async fetchAllMessages(
    queries: MessageQuery[],
    accessToken: string,
    workspaceId?: string,
    connectedAccountId?: string,
  ): Promise<GmailMessage[]> {
    let startTime = Date.now();
    const batchResponses = await this.fetchByBatchesService.fetchAllByBatches(
      queries,
      accessToken,
      'batch_gmail_messages',
    );
    let endTime = Date.now();

    this.logger.log(
      `Messaging import for workspace ${workspaceId} and account ${connectedAccountId} fetching ${
        queries.length
      } messages in ${endTime - startTime}ms`,
    );

    startTime = Date.now();

    const formattedResponse =
      await this.formatBatchResponsesAsGmailMessages(batchResponses);

    endTime = Date.now();

    this.logger.log(
      `Messaging import for workspace ${workspaceId} and account ${connectedAccountId} formatting ${
        queries.length
      } messages in ${endTime - startTime}ms`,
    );

    return formattedResponse;
  }

  async formatBatchResponseAsGmailMessage(
    responseCollection: AxiosResponse<any, any>,
  ): Promise<GmailMessage[]> {
    const parsedResponses =
      this.fetchByBatchesService.parseBatch(responseCollection);

    const sanitizeString = (str: string) => {
      return str.replace(/\0/g, '');
    };

    const formattedResponse = await Promise.all(
      parsedResponses.map(
        async (
          message: GmailMessageParsedResponse,
        ): Promise<GmailMessage | null> => {
          try {
            const {
              historyId,
              id,
              threadId,
              internalDate,
              subject,
              from,
              to,
              cc,
              bcc,
              headerMessageId,
              text,
              attachments,
            } = this.parseGmailMessage(message);

            if (!from) throw new Error('From value is missing');

            const participants = [
              ...formatAddressObjectAsParticipants(from, 'from'),
              ...formatAddressObjectAsParticipants(to, 'to'),
              ...formatAddressObjectAsParticipants(cc, 'cc'),
              ...formatAddressObjectAsParticipants(bcc, 'bcc'),
            ];

            let textWithoutReplyQuotations = text;

            if (text)
              try {
                textWithoutReplyQuotations = planer.extractFrom(
                  text,
                  'text/plain',
                );
              } catch (error) {
                console.log(
                  'Error while trying to remove reply quotations',
                  error,
                );
              }

            const messageFromGmail: GmailMessage = {
              historyId,
              externalId: id,
              headerMessageId,
              subject: subject || '',
              messageThreadExternalId: threadId,
              internalDate,
              fromHandle: from[0].address || '',
              fromDisplayName: from[0].name || '',
              participants,
              text: sanitizeString(textWithoutReplyQuotations || ''),
              attachments,
            };

            return messageFromGmail;
          } catch (error) {
            // if message was not found, silenty ignore it
            if (error?.code === 404) {
              return null;
            }

            throw error;
          }
        },
      ),
    );

    const filteredMessages = formattedResponse.filter((message) =>
      assertNotNull(message),
    ) as GmailMessage[];

    return filteredMessages;
  }

  async formatBatchResponsesAsGmailMessages(
    batchResponses: AxiosResponse<any, any>[],
  ): Promise<GmailMessage[]> {
    const messageBatches = await Promise.all(
      batchResponses.map(async (response) => {
        return this.formatBatchResponseAsGmailMessage(response);
      }),
    );

    return messageBatches.flat();
  }

  private parseGmailMessage(message: GmailMessageParsedResponse) {
    const subject = this.getPropertyFromHeaders(message, 'Subject');
    const rawFrom = this.getPropertyFromHeaders(message, 'From');
    const rawTo = this.getPropertyFromHeaders(message, 'To');
    const rawCc = this.getPropertyFromHeaders(message, 'Cc');
    const rawBcc = this.getPropertyFromHeaders(message, 'Bcc');
    const messageId = this.getPropertyFromHeaders(message, 'Message-ID');
    const id = message.id;
    const threadId = message.threadId;
    const historyId = message.historyId;
    const internalDate = message.internalDate;

    assert(id);
    assert(threadId);
    assert(historyId);
    assert(internalDate);

    const bodyData = this.getBodyData(message);
    const text = bodyData ? Buffer.from(bodyData, 'base64').toString() : '';

    return {
      id,
      headerMessageId: messageId,
      threadId,
      historyId,
      internalDate,
      subject,
      from: addressparser(rawFrom),
      to: addressparser(rawTo),
      cc: addressparser(rawCc),
      bcc: addressparser(rawBcc),
      text,
      attachments: [],
    };
  }

  private getBodyData(message: GmailMessageParsedResponse) {
    const firstPart = message.payload?.parts?.[0];

    if (firstPart?.mimeType === 'text/plain') {
      return firstPart?.body?.data;
    }

    return firstPart?.parts?.find((part) => part.mimeType === 'text/plain')
      ?.body?.data;
  }

  private getPropertyFromHeaders(
    message: GmailMessageParsedResponse,
    property: string,
  ) {
    const value = message.payload?.headers?.find(
      (header) => header.name === property,
    )?.value;

    if (value === undefined || value === null) {
      throw new Error(`Cannot find property "${property}" in message headers`);
    }

    return value;
  }
}
