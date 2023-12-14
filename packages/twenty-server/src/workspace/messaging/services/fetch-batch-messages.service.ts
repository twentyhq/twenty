import { Injectable } from '@nestjs/common';

@Injectable()
export class FetchBatchMessagesService {
  gmailBatchEndpoint = 'https://www.googleapis.com/batch/gmail/v1';

  async fetchBatch(messageQueries, refreshToken, batchLimit): Promise<any> {
    const limitedMessageQueries = messageQueries.slice(0, batchLimit);

    const res = await fetch(`${this.gmailBatchEndpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/mixed; boundary=batch_gmail_messages',
        Authorization: 'Bearer ' + refreshToken,
      },
      body: this.createBatchBody(limitedMessageQueries, 'batch_gmail_messages'),
    });

    console.log('batch', res);
  }

  createBatchBody(messageQueries, boundary: string): string {
    let batchBody: string[] = [];

    messageQueries.forEach(function (call) {
      console.log('call', call);
      const method = 'GET';
      const uri = call.uri;

      let body = '\r\n';

      if (call.body) {
        body = [
          'Content-Type: application/json',
          '\r\n\r\n',

          JSON.stringify(call.body),
          '\r\n',
        ].join('');
      }

      batchBody = batchBody.concat([
        '--',
        boundary,
        '\r\n',
        'Content-Type: application/http',
        '\r\n\r\n',

        method,
        ' ',
        uri,
      ]);
    });

    return batchBody.concat(['--', boundary, '--']).join('');
  }
}
