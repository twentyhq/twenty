import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';

import { type AxiosResponse } from 'axios';

import { type GmailMessageParsedResponse } from 'src/modules/messaging/message-import-manager/drivers/gmail/types/gmail-message-parsed-response.type';
import { createQueriesFromMessageIds } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/create-queries-from-message-ids.util';
import { type BatchQueries } from 'src/modules/messaging/message-import-manager/types/batch-queries';

@Injectable()
export class GmailFetchByBatchService {
  constructor(private readonly httpService: HttpService) {}

  async fetchAllByBatches(
    messageIds: string[],
    accessToken: string,
    boundary: string,
  ): Promise<{
    messageIdsByBatch: string[][];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    batchResponses: AxiosResponse<any, any>[];
  }> {
    const batchLimit = 20;

    let batchOffset = 0;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let batchResponses: AxiosResponse<any, any>[] = [];

    const messageIdsByBatch: string[][] = [];

    while (batchOffset < messageIds.length) {
      const batchResponse = await this.fetchBatch(
        messageIds,
        accessToken,
        batchOffset,
        batchLimit,
        boundary,
      );

      batchResponses = batchResponses.concat(batchResponse);

      messageIdsByBatch.push(
        messageIds.slice(batchOffset, batchOffset + batchLimit),
      );

      batchOffset += batchLimit;
    }

    return { messageIdsByBatch, batchResponses };
  }

  async fetchBatch(
    messageIds: string[],
    accessToken: string,
    batchOffset: number,
    batchLimit: number,
    boundary: string,

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<AxiosResponse<any, any>> {
    const queries = createQueriesFromMessageIds(messageIds);

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getBatchSeparator(responseCollection: AxiosResponse<any, any>): string {
    const headers = responseCollection.headers;

    const contentType: string = headers['content-type'];

    if (!contentType) return '';

    const components = contentType.split('; ');

    const boundary = components.find((item) => item.startsWith('boundary='));

    return boundary?.replace('boundary=', '').trim() || '';
  }
}
