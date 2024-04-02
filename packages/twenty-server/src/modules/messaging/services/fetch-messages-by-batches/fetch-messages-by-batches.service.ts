import { Injectable, Logger } from '@nestjs/common';

import { AxiosResponse } from 'axios';
import { simpleParser } from 'mailparser';
import planer from 'planer';

import { GmailMessage } from 'src/modules/messaging/types/gmail-message';
import { MessageQuery } from 'src/modules/messaging/types/message-or-thread-query';
import { GmailMessageParsedResponse } from 'src/modules/messaging/types/gmail-message-parsed-response';
import { FetchByBatchesService } from 'src/modules/messaging/services/fetch-by-batch/fetch-by-batch.service';
import { formatAddressObjectAsParticipants } from 'src/modules/messaging/services/utils/format-address-object-as-participants.util';

@Injectable()
export class FetchMessagesByBatchesService {
  private readonly logger = new Logger(FetchMessagesByBatchesService.name);

  constructor(private readonly fetchByBatchesService: FetchByBatchesService) {}

  async fetchAllMessages(
    queries: MessageQuery[],
    accessToken: string,
    workspaceId?: string,
    connectedAccountId?: string,
  ): Promise<{ messages: GmailMessage[]; errors: any[] }> {
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
  ): Promise<{ messages: GmailMessage[]; errors: any[] }> {
    const parsedResponses = this.fetchByBatchesService.parseBatch(
      responseCollection,
    ) as GmailMessageParsedResponse[];

    const errors: any = [];

    const sanitizeString = (str: string) => {
      return str.replace(/\0/g, '');
    };

    const formattedResponse = Promise.all(
      parsedResponses.map(async (message: GmailMessageParsedResponse) => {
        if (message.error) {
          errors.push(message.error);

          return;
        }

        const { historyId, id, threadId, internalDate, raw } = message;

        const body = atob(raw?.replace(/-/g, '+').replace(/_/g, '/'));

        try {
          const parsed = await simpleParser(body, {
            skipHtmlToText: true,
            skipImageLinks: true,
            skipTextToHtml: true,
            maxHtmlLengthToParse: 0,
          });

          const { subject, messageId, from, to, cc, bcc, text, attachments } =
            parsed;

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
            headerMessageId: messageId || '',
            subject: subject || '',
            messageThreadExternalId: threadId,
            internalDate,
            fromHandle: from.value[0].address || '',
            fromDisplayName: from.value[0].name || '',
            participants,
            text: sanitizeString(textWithoutReplyQuotations || ''),
            attachments,
          };

          return messageFromGmail;
        } catch (error) {
          console.log('Error', error);

          errors.push(error);
        }
      }),
    );

    const filteredMessages = (await formattedResponse).filter(
      (message) => message,
    ) as GmailMessage[];

    return { messages: filteredMessages, errors };
  }

  async formatBatchResponsesAsGmailMessages(
    batchResponses: AxiosResponse<any, any>[],
  ): Promise<{ messages: GmailMessage[]; errors: any[] }> {
    const messagesAndErrors = await Promise.all(
      batchResponses.map(async (response) => {
        return this.formatBatchResponseAsGmailMessage(response);
      }),
    );

    const messages = messagesAndErrors.map((item) => item.messages).flat();

    const errors = messagesAndErrors.map((item) => item.errors).flat();

    return { messages, errors };
  }
}
