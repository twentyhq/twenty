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

      let content: string[] = [];

      if (parts) {
        content = this.processParts(parts);
      } else {
        content = [
          atob(payload?.body?.data.replace(/-/g, '+').replace(/_/g, '/')),
        ];
      }

      const from = headers?.find((header) => header.name === 'From')?.value;

      const { displayNames: fromDisplayNames, emails: fromEmails } =
        this.formatDisplayNamesAndEmails(from);

      const to = headers?.find((header) => header.name === 'To')?.value;
      const { displayNames: toDisplayNames, emails: toEmails } =
        this.formatDisplayNamesAndEmails(to);

      const cc = headers?.find((header) => header.name === 'Cc')?.value;
      const { displayNames: ccDisplayNames, emails: ccEmails } =
        this.formatDisplayNamesAndEmails(cc);

      const bcc = headers?.find((header) => header.name === 'Bcc')?.value;
      const { displayNames: bccDisplayNames, emails: bccEmails } =
        this.formatDisplayNamesAndEmails(bcc);

      return {
        externalId: id,
        headerMessageId: headers?.find((header) => header.name === 'Message-ID')
          ?.value,
        subject: headers?.find((header) => header.name === 'Subject')?.value,
        messageThreadId: threadId,
        fromDisplayNames,
        fromEmails,
        toDisplayNames,
        toEmails,
        ccDisplayNames,
        ccEmails,
        bccDisplayNames,
        bccEmails,
        date: internalDate,
        body: content[0],
      };
    });
  }

  formatDisplayNamesAndEmails(displayNamesAndEmails) {
    const displayNamesString = displayNamesAndEmails?.split('<')[0]?.trim();
    const emailsString = displayNamesAndEmails
      ?.split('<')[1]
      ?.split('>')[0]
      ?.trim();

    const displayNames = displayNamesString?.split(',').map((displayName) => {
      return displayName.trim();
    });

    const emails = emailsString?.split(',').map((email) => {
      return email.trim();
    });

    return { displayNames, emails };
  }

  processParts(parts) {
    // we get only the plain text for now
    const content: any = [];

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];

      const isPlain = part.mimeType === 'text/plain';
      //const isHtml = part.mimeType === 'text/html';
      const isMultiPart = part.mimeType === 'multipart/alternative';
      //const isAttachment = part.body.attachmentId != undefined;

      if (isPlain) {
        content.push(
          atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/')),
        );
      }

      if (isMultiPart) {
        content.push(...this.processParts(part.parts));
      }

      // if (isPlain || isHtml) {
      //   content.push(
      //     atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/')),
      //   );
      // }
      // if (isMultiPart) {
      //   content.push(...this.processParts(part.parts));
      // }
      // if (isAttachment) {
      //   content.push(part.body.attachmentId);
      // }
    }

    return content;
  }
}
