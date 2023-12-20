import { Injectable } from '@nestjs/common';

import axios, { AxiosInstance } from 'axios';
import { simpleParser } from 'mailparser';

@Injectable()
export class FetchBatchMessagesService {
  private readonly httpService: AxiosInstance;

  constructor() {
    this.httpService = axios.create({
      baseURL: 'https://www.googleapis.com/batch/gmail/v1',
    });
  }

  async fetchAllByBatches(messageQueries, accessToken: string): Promise<any> {
    const batchLimit = 100;

    let messages = [];

    let batchOffset = 0;

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
    messageQueries,
    accessToken: string,
    batchOffset: number,
    batchLimit: number,
  ): Promise<any> {
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

  createBatchBody(messageQueries, boundary: string): string {
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

  parseBatch(responseCollection) {
    const items: any = [];

    const boundary = this.getBatchSeparator(responseCollection);

    const responseLines = responseCollection.data.split('--' + boundary);

    responseLines.forEach(function (response) {
      const startJson = response.indexOf('{');
      const endJson = response.lastIndexOf('}');

      if (startJson < 0 || endJson < 0) {
        return;
      }

      const responseJson = response.substr(startJson, endJson - startJson + 1);

      const item = JSON.parse(responseJson);

      items.push(item);
    });

    return items;
  }

  getBatchSeparator(response) {
    const headers = response.headers;

    if (!headers['content-type']) return '';

    const components = headers['content-type'].split('; ');

    const boundary = components.find((o) => o.startsWith('boundary='));

    return boundary.replace('boundary=', '').trim('; ');
  }

  async formatBatchResponse(response) {
    const parsedResponse = this.parseBatch(response);

    return Promise.all(
      parsedResponse.map(async (item) => {
        const { id, threadId, internalDate, raw } = item;

        const message = atob(raw?.replace(/-/g, '+').replace(/_/g, '/'));

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

        return {
          externalId: id,
          headerMessageId: messageId,
          subject: subject,
          messageThreadId: threadId,
          internalDate,
          from,
          to,
          cc,
          bcc,
          text,
          html,
          attachments,
        };
      }),
    );
  }
}
