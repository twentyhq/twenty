import nodeFetch from 'node-fetch';

import { setupMicrosoftMock } from 'test/integration/microsoft/mocks/setup-microsoft-mock.util';

jest.useRealTimers();

describe('Microsoft mailbox message listing', () => {
  setupMicrosoftMock({
    handle: 'mailbox-listing@apple.dev',
    messages: [
      { id: 'inbox-message', parentFolderId: 'inbox' },
      { id: 'sent-message-1', parentFolderId: 'sentitems' },
      { id: 'sent-message-2', parentFolderId: 'sentitems' },
    ],
  });

  it('serves the recent sent-message lookup with the requested folder and limit', async () => {
    const response = await nodeFetch(
      'https://graph.microsoft.com/v1.0/me/mailFolders/sentitems/messages?$select=id&$orderby=sentDateTime%20desc&$top=1',
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      value: [{ id: 'sent-message-1' }],
    });
  });

  it('returns an empty list for a folder without messages', async () => {
    const response = await nodeFetch(
      'https://graph.microsoft.com/v1.0/me/mailFolders/drafts/messages?$select=id&$top=100',
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ value: [] });
  });
});
