import { http, HttpResponse } from 'msw';

import { type MswHandler } from 'test/integration/utils/http-mock.util';

const BATCH_BOUNDARY = 'batch_boundary';

const HTTP_STATUS_TEXT: Record<number, string> = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  410: 'Gone',
  429: 'Too Many Requests',
  500: 'Internal Server Error',
  503: 'Service Unavailable',
};

// The Gmail driver fetches messages through the batch endpoint, so a failure has
// to be expressed as a per-sub-response status inside the multipart body: the
// batcher maps each sub-response back to the individual messages.get() promise.
export const gmailFailingMessageFetchHandlers = ({
  status,
  reason,
  message,
}: {
  status: number;
  reason: string;
  message: string;
}): MswHandler[] => {
  const errorBody = JSON.stringify({
    error: { code: status, message, errors: [{ reason, message }] },
  });

  return [
    http.post('*/batch', async ({ request }) => {
      const requestedIds = [
        ...(await request.text()).matchAll(/messages\/([\w-]+)/g),
      ].map((match) => match[1]);

      const subResponses = requestedIds
        .map(() =>
          [
            `--${BATCH_BOUNDARY}`,
            'Content-Type: application/http',
            '',
            `HTTP/1.1 ${status} ${HTTP_STATUS_TEXT[status] ?? 'Error'}`,
            'Content-Type: application/json; charset=UTF-8',
            '',
            errorBody,
          ].join('\r\n'),
        )
        .join('\r\n');

      return new HttpResponse(`${subResponses}\r\n--${BATCH_BOUNDARY}--`, {
        headers: {
          'Content-Type': `multipart/mixed; boundary=${BATCH_BOUNDARY}`,
        },
      });
    }),
    http.get('*/gmail/v1/users/me/messages/:messageId', () =>
      HttpResponse.json(JSON.parse(errorBody), { status }),
    ),
  ];
};
