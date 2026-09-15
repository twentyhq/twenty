import { HttpResponse } from 'msw';

export const gmailBatchMultipartResponse = (
  subResponses: { statusLine: string; body: unknown }[],
): HttpResponse<string> => {
  const boundary = 'batch_boundary';
  const parts = subResponses
    .map(({ statusLine, body }) =>
      [
        `--${boundary}`,
        'Content-Type: application/http',
        '',
        `HTTP/1.1 ${statusLine}`,
        'Content-Type: application/json; charset=UTF-8',
        '',
        JSON.stringify(body),
      ].join('\r\n'),
    )
    .join('\r\n');

  return new HttpResponse(`${parts}\r\n--${boundary}--`, {
    headers: { 'Content-Type': `multipart/mixed; boundary=${boundary}` },
  });
};
