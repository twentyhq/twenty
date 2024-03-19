import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';

import { AxiosResponse } from 'axios';

import { BatchQueries } from 'src/modules/messaging/types/batch-queries';
import { GmailMessageParsedResponse } from 'src/modules/messaging/types/gmail-message-parsed-response';

@Injectable()
export class FetchByBatchesService {
  constructor(private readonly httpService: HttpService) {}

  async fetchAllByBatches(
    queries: BatchQueries,
    accessToken: string,
    boundary: string,
  ): Promise<AxiosResponse<any, any>[]> {
    const batchLimit = 50;

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
    queries: BatchQueries,
    accessToken: string,
    batchOffset: number,
    batchLimit: number,
    boundary: string,
  ): Promise<AxiosResponse<any, any>> {
    const limitedQueries = queries.slice(batchOffset, batchOffset + batchLimit);

    const response = await this.httpService.axiosRef.post(
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

  createBatchBody(queries: BatchQueries, boundary: string): string {
    let batchBody: string[] = [];

    queries.forEach(function (call) {
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
  ): GmailMessageParsedResponse[] {
    const responseItems: GmailMessageParsedResponse[] = [];

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
}
