import { Injectable, Logger } from '@nestjs/common';

import { AxiosResponse } from 'axios';
import planer from 'planer';
import addressparser from 'addressparser';
import { gmail_v1 } from 'googleapis';

import { GmailMessage } from 'src/modules/messaging/types/gmail-message';
import { MessageQuery } from 'src/modules/messaging/types/message-or-thread-query';
import { FetchByBatchesService } from 'src/modules/messaging/services/fetch-by-batch/fetch-by-batch.service';
import { formatAddressObjectAsParticipants } from 'src/modules/messaging/services/utils/format-address-object-as-participants.util';
import { assert, assertNotNull } from 'src/utils/assert';

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
      this.formatBatchResponsesAsGmailMessages(batchResponses);

    endTime = Date.now();

    this.logger.log(
      `Messaging import for workspace ${workspaceId} and account ${connectedAccountId} formatting ${
        queries.length
      } messages in ${endTime - startTime}ms`,
    );

    return formattedResponse;
  }

  private formatBatchResponseAsGmailMessage(
    responseCollection: AxiosResponse<any, any>,
  ): GmailMessage[] {
    const parsedResponses =
      this.fetchByBatchesService.parseBatch(responseCollection);

    const sanitizeString = (str: string) => {
      return str.replace(/\0/g, '');
    };

    const formattedResponse = parsedResponses.map(
      (response): GmailMessage | null => {
        if ('error' in response) {
          if (response.error.code === 404) {
            return null;
          }

          throw response.error;
        }

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
          } = this.parseGmailMessage(response);

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
          console.log('Error while trying to parse a message', response, error);

          return null;
        }
      },
    );

    const filteredMessages = formattedResponse.filter((message) =>
      assertNotNull(message),
    ) as GmailMessage[];

    return filteredMessages;
  }

  private formatBatchResponsesAsGmailMessages(
    batchResponses: AxiosResponse<any, any>[],
  ): GmailMessage[] {
    const messageBatches = batchResponses.map((response) => {
      return this.formatBatchResponseAsGmailMessage(response);
    });

    return messageBatches.flat();
  }

  private parseGmailMessage(message: gmail_v1.Schema$Message) {
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
    assert(messageId);
    assert(rawFrom);
    assert(rawTo);
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
      cc: rawCc ? addressparser(rawCc) : undefined,
      bcc: rawBcc ? addressparser(rawBcc) : undefined,
      text,
      attachments: [],
    };
  }

  private getBodyData(message: gmail_v1.Schema$Message) {
    const firstPart = message.payload?.parts?.[0];

    if (firstPart?.mimeType === 'text/plain') {
      return firstPart?.body?.data;
    }

    return firstPart?.parts?.find((part) => part.mimeType === 'text/plain')
      ?.body?.data;
  }

  private getPropertyFromHeaders(
    message: gmail_v1.Schema$Message,
    property: string,
  ) {
    const header = message.payload?.headers?.find(
      (header) => header.name === property,
    );

    return header?.value;
  }
}
