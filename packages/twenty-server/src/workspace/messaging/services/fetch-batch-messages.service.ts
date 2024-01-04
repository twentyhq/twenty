import { Injectable } from '@nestjs/common';

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { simpleParser } from 'mailparser';

import { GmailMessage } from 'src/workspace/messaging/types/gmailMessage';
import { MessageOrThreadQuery } from 'src/workspace/messaging/types/messageOrThreadQuery';
import { GmailMessageParsedResponse } from 'src/workspace/messaging/types/gmailMessageParsedResponse';
import { GmailThreadParsedResponse } from 'src/workspace/messaging/types/gmailThreadParsedResponse';
import { GmailThread } from 'src/workspace/messaging/types/gmailThread';

@Injectable()
export class FetchBatchMessagesService {
  private readonly httpService: AxiosInstance;

  constructor() {
    this.httpService = axios.create({
      baseURL: 'https://www.googleapis.com/batch/gmail/v1',
    });
  }

  async fetchAllMessages(
    queries: MessageOrThreadQuery[],
    accessToken: string,
  ): Promise<GmailMessage[]> {
    const batchResponses = await this.fetchAllByBatches(
      queries,
      accessToken,
      'batch_gmail_messages',
    );

    const messages =
      await this.formatBatchResponsesAsGmailMessages(batchResponses);

    return messages;
  }

  async fetchAllThreads(
    queries: MessageOrThreadQuery[],
    accessToken: string,
  ): Promise<GmailThread[]> {
    const batchResponses = await this.fetchAllByBatches(
      queries,
      accessToken,
      'batch_gmail_threads',
    );

    const threads =
      await this.formatBatchResponsesAsGmailThreads(batchResponses);

    return threads;
  }

  async fetchAllByBatches(
    queries: MessageOrThreadQuery[],
    accessToken: string,
    boundary: string,
  ): Promise<AxiosResponse<any, any>[]> {
    const batchLimit = 100;

    let batchOffset = 0;

    let batchResponses: AxiosResponse<any, any>[] = [];

    while (batchOffset < queries.length) {
      const batchResponse = await this.fetchBatch(
        queries,
        accessToken,
        batchOffset,
        batchLimit,
        boundary,
      );

      batchResponses = batchResponses.concat(batchResponse);

      batchOffset += batchLimit;
    }

    return batchResponses;
  }

  async fetchBatch(
    queries: MessageOrThreadQuery[],
    accessToken: string,
    batchOffset: number,
    batchLimit: number,
    boundary: string,
  ): Promise<AxiosResponse<any, any>> {
    const limitedQueries = queries.slice(batchOffset, batchOffset + batchLimit);

    const response = await this.httpService.post(
      '/',
      this.createBatchBody(limitedQueries, boundary),
      {
        headers: {
          'Content-Type': 'multipart/mixed; boundary=' + boundary,
          Authorization: 'Bearer ' + accessToken,
        },
      },
    );

    return response;
  }

  createBatchBody(
    messageQueries: MessageOrThreadQuery[],
    boundary: string,
  ): string {
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
  ): GmailMessageParsedResponse[] | GmailThreadParsedResponse[] {
    const responseItems:
      | GmailMessageParsedResponse[]
      | GmailThreadParsedResponse[] = [];

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

  getBatchSeparator(responseCollection: AxiosResponse<any, any>): string {
    const headers = responseCollection.headers;

    const contentType: string = headers['content-type'];

    if (!contentType) return '';

    const components = contentType.split('; ');

    const boundary = components.find((item) => item.startsWith('boundary='));

    return boundary?.replace('boundary=', '').trim() || '';
  }

  async formatBatchResponseAsGmailMessage(
    responseCollection: AxiosResponse<any, any>,
  ): Promise<GmailMessage[]> {
    const parsedResponses = this.parseBatch(
      responseCollection,
    ) as GmailMessageParsedResponse[];

    const formattedResponse = Promise.all(
      parsedResponses.map(async (message: GmailMessageParsedResponse) => {
        if (message.error) {
          console.log('Error', message.error);

          return;
        }

        const { id, threadId, internalDate, raw } = message;

        const body = atob(raw?.replace(/-/g, '+').replace(/_/g, '/'));

        try {
          const parsed = await simpleParser(body);

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
      (message) => message,
    ) as GmailMessage[];

    return filteredResponse;
  }

  async formatBatchResponsesAsGmailMessages(
    batchResponses: AxiosResponse<any, any>[],
  ): Promise<GmailMessage[]> {
    const formattedResponses = await Promise.all(
      batchResponses.map(async (response) => {
        const formattedResponse =
          await this.formatBatchResponseAsGmailMessage(response);

        return formattedResponse;
      }),
    );

    return formattedResponses.flat();
  }

  async formatBatchResponseAsGmailThread(
    responseCollection: AxiosResponse<any, any>,
  ): Promise<GmailThread[]> {
    const parsedResponses = this.parseBatch(
      responseCollection,
    ) as GmailThreadParsedResponse[];

    const formattedResponse = Promise.all(
      parsedResponses.map(async (thread: GmailThreadParsedResponse) => {
        if (thread.error) {
          console.log('Error', thread.error);

          return;
        }
        try {
          const { id, messages } = thread;

          return {
            id,
            messageIds: messages.map((message) => message.id) || [],
          };
        } catch (error) {
          console.log('Error', error);
        }
      }),
    );

    const filteredResponse = (await formattedResponse).filter(
      (item) => item,
    ) as GmailThread[];

    return filteredResponse;
  }

  async formatBatchResponsesAsGmailThreads(
    batchResponses: AxiosResponse<any, any>[],
  ): Promise<GmailThread[]> {
    const formattedResponses = await Promise.all(
      batchResponses.map(async (response) => {
        const formattedResponse =
          await this.formatBatchResponseAsGmailThread(response);

        return formattedResponse;
      }),
    );

    return formattedResponses.flat();
  }
}
