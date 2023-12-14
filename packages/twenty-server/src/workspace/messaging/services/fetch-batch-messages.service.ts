import { Injectable } from '@nestjs/common';

import axios, { AxiosInstance } from 'axios';

@Injectable()
export class FetchBatchMessagesService {
  private readonly httpService: AxiosInstance;

  constructor() {
    this.httpService = axios.create({
      baseURL: 'https://www.googleapis.com/batch/gmail/v1',
    });
  }

  async fetchAllByBatches(messageQueries, accessToken: string): Promise<any> {
    const batchLimit = Math.min(messageQueries.length, 50);

    let messages = [];

    let batchOffset = 0;

    console.log('messageQueries', messageQueries);

    while (batchOffset < messageQueries.length) {
      const queries = messageQueries.slice(batchOffset);

      if (queries.length === 0) {
        break;
      }

      const batchResponse = await this.fetchBatch(
        queries,
        accessToken,
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
    batchLimit: number,
  ): Promise<any> {
    const limitedMessageQueries = messageQueries.slice(0, batchLimit);

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

    console.log('response', response);

    return this.formatBatchResponse(response);
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

  formatBatchResponse(response) {
    const parsedResponse = this.parseBatch(response);

    return parsedResponse.map((item) => {
      const { id, threadId, payload } = item;

      const headers = payload.headers;

      const bodyBase64 = payload.parts[0].body.data;

      if (!bodyBase64) {
        return;
      }

      const body = atob(bodyBase64.replace(/-/g, '+').replace(/_/g, '/'));

      return {
        externalId: id,
        headerMessageId: headers.find((header) => header.name === 'Message-ID')
          .value,
        subject: headers.find((header) => header.name === 'Subject').value,
        messageThreadId: threadId,
        from: headers.find((header) => header.name === 'From').value,
        body,
      };
    });
  }
}
