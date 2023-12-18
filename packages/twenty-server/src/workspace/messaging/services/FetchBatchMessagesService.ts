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
      const { id, threadId, payload, internalDate } = item;

      const headers = payload?.headers;

      const parts = payload?.parts;

      if (!parts) {
        return;
      }

      const bodyBase64 = parts[0]?.body?.data;

      if (!bodyBase64) {
        return;
      }

      const body = atob(bodyBase64.replace(/-/g, '+').replace(/_/g, '/'));

      //"displayName < email >"
      const from = headers?.find((header) => header.name === 'From')?.value;

      const { displayName: fromDisplayName, email: fromEmail } =
        this.formatDisplayNamesAndEmails(from);

      const to = headers?.find((header) => header.name === 'To')?.value;
      const { displayName: toDisplayName, email: toEmail } =
        this.formatDisplayNamesAndEmails(to);

      const cc = headers?.find((header) => header.name === 'Cc')?.value;
      const { displayName: ccDisplayName, email: ccEmail } =
        this.formatDisplayNamesAndEmails(cc);

      const bcc = headers?.find((header) => header.name === 'Bcc')?.value;
      const { displayName: bccDisplayName, email: bccEmail } =
        this.formatDisplayNamesAndEmails(bcc);

      return {
        externalId: id,
        headerMessageId: headers?.find((header) => header.name === 'Message-ID')
          ?.value,
        subject: headers?.find((header) => header.name === 'Subject')?.value,
        messageThreadId: threadId,
        fromDisplayName,
        fromEmail,
        toDisplayName,
        toEmail,
        ccDisplayName,
        ccEmail,
        bccDisplayName,
        bccEmail,
        date: internalDate,
        body,
      };
    });
  }

  formatDisplayNamesAndEmails(displayNameAndEmail) {
    const displayName = displayNameAndEmail?.split('<')[0]?.trim();
    const email = displayNameAndEmail?.split('<')[1]?.split('>')[0]?.trim();

    return { displayName, email };
  }

  processParts(parts) {
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];

      if (part.mimeType === 'multipart/alternative') {
        return this.processParts(part.parts);
      }

      if (part.mimeType === 'text/plain') return part.body.data;
    }

    if (part.mimeType === 'text/html') {
      return part.body.data;
    }
  }
}
