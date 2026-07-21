import { randomUUID } from 'node:crypto';

import { type gmail_v1 } from 'googleapis';

export const gmailMessage = (
  overrides: Partial<gmail_v1.Schema$Message> = {},
): gmail_v1.Schema$Message => {
  const id = overrides.id ?? `gmail-msg-${randomUUID()}`;

  return {
    id,
    threadId: id,
    historyId: '987654321',
    internalDate: '1700000000000',
    labelIds: ['INBOX'],
    payload: {
      mimeType: 'text/plain',
      headers: [
        { name: 'From', value: `sender-${id}@example.com` },
        { name: 'To', value: `recipient-${id}@example.com` },
        { name: 'Subject', value: `Subject ${id}` },
        { name: 'Message-ID', value: `<${id}@example.com>` },
        { name: 'Date', value: 'Wed, 15 Nov 2023 00:00:00 +0000' },
      ],
      body: {
        data: Buffer.from(`body ${id}`).toString('base64'),
        size: 10,
      },
    },
    ...overrides,
  };
};
