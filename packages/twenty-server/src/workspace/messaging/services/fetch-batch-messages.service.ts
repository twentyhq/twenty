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

    return this.parseBatch(response);
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

    console.log('boundary', boundary);

    const responseLines = responseCollection.data.split('--' + boundary);

    // remove --batch_8vTxk_nJYHdcjCb88OGrftDiX-Qz98Uj--
    //responseLines.pop();

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
}
