import { type Event, type MailFolder } from '@microsoft/microsoft-graph-types';
import { http, HttpResponse } from 'msw';

import {
  type MswHandler,
  setupHttpMock,
} from 'test/integration/mocks/http-mock.util';
import {
  createMockEntityStore,
  type MockEntityStore,
} from 'test/integration/mocks/mock-entity-store.util';

const DEFAULT_FOLDERS: MailFolder[] = [
  { id: 'inbox', displayName: 'Inbox' },
  { id: 'sentitems', displayName: 'Sent Items' },
];

const authHandlers = (handle: string): MswHandler[] => [
  http.post('https://login.microsoftonline.com/common/oauth2/v2.0/token', () =>
    HttpResponse.json({
      token_type: 'Bearer',
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      expires_in: 3600,
      scope: 'openid profile email offline_access',
    }),
  ),
  http.get('https://graph.microsoft.com/v1.0/me', () =>
    HttpResponse.json({
      id: 'microsoft-user-id',
      displayName: 'Jane Austen',
      givenName: 'Jane',
      surname: 'Austen',
      mail: handle,
      userPrincipalName: handle,
    }),
  ),
];

const calendarEventsHandlers = (
  events: Event[],
  deltaToken: string,
): MswHandler[] => [
  http.get('*/me/calendar/events/delta', () =>
    HttpResponse.json({
      value: events.map((event) => ({ id: event.id })),
      '@odata.deltaLink': `https://graph.microsoft.com/beta/me/calendar/events/delta?$deltatoken=${deltaToken}`,
    }),
  ),
  ...events.map((event) =>
    http.get(`*/me/calendar/events/${event.id}`, () =>
      HttpResponse.json(event),
    ),
  ),
];

const mailboxHandlers = (
  folderStore: MockEntityStore<MailFolder>,
): MswHandler[] => [
  http.get('*/me/mailFolders', () =>
    HttpResponse.json<{ value: MailFolder[] }>({ value: folderStore.list() }),
  ),
  http.get('*/messages/delta', () =>
    HttpResponse.json({
      value: [],
      '@odata.deltaLink':
        'https://graph.microsoft.com/beta/me/mailfolders/inbox/messages/delta?$deltatoken=mock-delta-token',
    }),
  ),
  http.post('*/$batch', () =>
    HttpResponse.json<{ responses: never[] }>({ responses: [] }),
  ),
];

export type MicrosoftMock = {
  folders: MockEntityStore<MailFolder>;
  serveCalendarEvents: (
    events: Event[],
    options?: { deltaToken?: string },
  ) => void;
};

export const setupMicrosoftMock = ({
  handle,
  folders = DEFAULT_FOLDERS,
}: {
  handle: string;
  folders?: MailFolder[];
}): MicrosoftMock => {
  const folderStore = createMockEntityStore(
    folders,
    (folder) => folder.id ?? '',
  );

  const httpMock = setupHttpMock(
    ...authHandlers(handle),
    ...mailboxHandlers(folderStore),
  );

  return {
    folders: folderStore,
    serveCalendarEvents: (
      events,
      { deltaToken = 'mock-calendar-delta-token' } = {},
    ) => httpMock.use(...calendarEventsHandlers(events, deltaToken)),
  };
};
