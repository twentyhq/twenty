import { type Event, type MailFolder } from '@microsoft/microsoft-graph-types';

import { setupHttpMock } from 'test/integration/utils/http-mock.util';
import { microsoftAuthHandlers } from 'test/integration/microsoft/mocks/microsoft-auth-handlers.util';
import { microsoftCalendarEventsHandlers } from 'test/integration/microsoft/mocks/microsoft-calendar-events-handlers.util';
import { microsoftMailboxHandlers } from 'test/integration/microsoft/mocks/microsoft-mailbox-handlers.util';
import {
  createMockEntityStore,
  type MockEntityStore,
} from 'test/integration/utils/mock-entity-store.util';

const DEFAULT_FOLDERS: MailFolder[] = [
  { id: 'inbox', displayName: 'Inbox' },
  { id: 'sentitems', displayName: 'Sent Items' },
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
    ...microsoftAuthHandlers(handle),
    ...microsoftMailboxHandlers(folderStore),
  );

  return {
    folders: folderStore,
    serveCalendarEvents: (
      events,
      { deltaToken = 'mock-calendar-delta-token' } = {},
    ) => httpMock.use(...microsoftCalendarEventsHandlers(events, deltaToken)),
  };
};
