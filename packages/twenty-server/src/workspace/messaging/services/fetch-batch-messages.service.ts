import { Injectable } from '@nestjs/common';

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { simpleParser } from 'mailparser';

import { GmailMessage } from 'src/workspace/messaging/types/gmailMessage';
import { MessageQuery } from 'src/workspace/messaging/types/messageQuery';
import { GmailParsedResponse } from 'src/workspace/messaging/types/gmailParsedResponse';

@Injectable()
export class FetchBatchMessagesService {
  private readonly httpService: AxiosInstance;

  constructor() {
    this.httpService = axios.create({
      baseURL: 'https://www.googleapis.com/batch/gmail/v1',
    });
  }

  async fetchAllByBatches(
    messageQueries: MessageQuery[],
    accessToken: string,
  ): Promise<GmailMessage[]> {
    const batchLimit = 100;

    let batchOffset = 0;

    let messages: GmailMessage[] = [];

    while (batchOffset < messageQueries.length) {
      const batchResponse = await this.fetchBatch(
        messageQueries,
        accessToken,
        batchOffset,
        batchLimit,
      );

      messages = messages.concat(batchResponse);

      batchOffset += batchLimit;
    }

    return messages;
  }

  async fetchBatch(
    messageQueries: MessageQuery[],
    accessToken: string,
    batchOffset: number,
    batchLimit: number,
  ): Promise<GmailMessage[]> {
    const limitedMessageQueries = messageQueries.slice(
      batchOffset,
      batchOffset + batchLimit,
    );

    const response = await this.httpService.post(
      '/',
      this.createBatchBody(limitedMessageQueries, 'batch_gmail_messages'),
      {
        headers: {
          'Content-Type': 'multipart/mixed; boundary=batch_gmail_messages',
          Authorization: 'Bearer ' + accessToken,
        },
      },
    );

    const formattedResponse = await this.formatBatchResponse(response);

    return formattedResponse;
  }

  createBatchBody(messageQueries: MessageQuery[], boundary: string): string {
    let batchBody: string[] = [];

    messageQueries.forEach(function (call) {
      const method = 'GET';
      const uri = call.uri;

      batchBody = batchBody.concat([
        '--',
        boundary,
        '\r\n',
        'Content-Type: application/http',
        '\r\n\r\n',

        method,
        ' ',
        uri,
        '\r\n\r\n',
      ]);
    });

    return batchBody.concat(['--', boundary, '--']).join('');
  }

  parseBatch(
    responseCollection: AxiosResponse<any, any>,
  ): GmailParsedResponse[] {
    const responseItems: GmailParsedResponse[] = [];

    const boundary = this.getBatchSeparator(responseCollection);

    const responseLines: string[] = responseCollection.data.split(
      '--' + boundary,
    );

    responseLines.forEach(function (response) {
      const startJson = response.indexOf('{');
      const endJson = response.lastIndexOf('}');

      if (startJson < 0 || endJson < 0) return;

      const responseJson = response.substring(startJson, endJson + 1);

      const item = JSON.parse(responseJson);

      responseItems.push(item);
    });

    return responseItems;
  }

  getBatchSeparator(response: AxiosResponse<any, any>): string {
    const headers = response.headers;

    const contentType: string = headers['content-type'];

    if (!contentType) return '';

    const components = contentType.split('; ');

    const boundary = components.find((item) => item.startsWith('boundary='));

    return boundary?.replace('boundary=', '').trim() || '';
  }

  async formatBatchResponse(
    response: AxiosResponse<any, any>,
  ): Promise<GmailMessage[]> {
    const parsedResponses = this.parseBatch(response);

    const formattedResponse = Promise.all(
      parsedResponses.map(async (item) => {
        if (item.error) {
          console.log('Error', item.error);

          return;
        }

        const { id, threadId, internalDate, raw } = item;

        const message = atob(raw?.replace(/-/g, '+').replace(/_/g, '/'));

        try {
          const parsed = await simpleParser(message);

          const {
            subject,
            messageId,
            from,
            to,
            cc,
            bcc,
            text,
            html,
            attachments,
          } = parsed;

          const messageFromGmail: GmailMessage = {
            externalId: id,
            headerMessageId: messageId || '',
            subject: subject || '',
            messageThreadId: threadId,
            internalDate,
            from,
            to,
            cc,
            bcc,
            text: text || '',
            html: html || '',
            attachments,
          };

          return messageFromGmail;
        } catch (error) {
          console.log('Error', error);
        }
      }),
    );

    const filteredResponse = (await formattedResponse).filter(
      (item) => item,
    ) as GmailMessage[];

    return filteredResponse;
  }
}
