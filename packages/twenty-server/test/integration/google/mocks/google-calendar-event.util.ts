import { randomUUID } from 'node:crypto';

import { type calendar_v3 } from 'googleapis';

export const googleCalendarEvent = (
  overrides: Partial<calendar_v3.Schema$Event> = {},
): calendar_v3.Schema$Event => {
  const id = overrides.id ?? `google-calendar-event-${randomUUID()}`;

  return {
    id,
    iCalUID: `${id}@google.com`,
    summary: `Calendar event ${id}`,
    status: 'confirmed',
    start: { dateTime: '2023-11-15T10:00:00Z' },
    end: { dateTime: '2023-11-15T11:00:00Z' },
    created: '2023-11-01T00:00:00.000Z',
    updated: '2023-11-01T00:00:00.000Z',
    attendees: [],
    ...overrides,
  };
};
