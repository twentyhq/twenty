import { ConnectedAccountOperation, ConnectedAccountProvider } from '@/types';
import { canConnectedAccountCreateCalendarEvent } from '@/utils/connected-account/canConnectedAccountCreateCalendarEvent';
import { canConnectedAccountPerformOperation } from '@/utils/connected-account/canConnectedAccountPerformOperation';
import { getMissingScopesForOperation } from '@/utils/connected-account/getMissingScopesForOperation';

const GOOGLE_CALENDAR_EVENTS_SCOPE =
  'https://www.googleapis.com/auth/calendar.events';
const MICROSOFT_CALENDARS_READ_WRITE_SCOPE = 'Calendars.ReadWrite';

describe('canConnectedAccountPerformOperation', () => {
  it('refuses a provider that does not support the operation', () => {
    expect(
      canConnectedAccountPerformOperation({
        connectedAccount: { provider: ConnectedAccountProvider.EMAIL_GROUP },
        operation: ConnectedAccountOperation.CREATE_CALENDAR_EVENT,
      }),
    ).toBe(false);
  });

  it('lets an email group send email', () => {
    expect(
      canConnectedAccountPerformOperation({
        connectedAccount: { provider: ConnectedAccountProvider.EMAIL_GROUP },
        operation: ConnectedAccountOperation.SEND_EMAIL,
      }),
    ).toBe(true);
  });

  it('refuses a Google account connected before the calendar scope was granted', () => {
    expect(
      canConnectedAccountPerformOperation({
        connectedAccount: {
          provider: ConnectedAccountProvider.GOOGLE,
          scopes: ['email', 'profile'],
        },
        operation: ConnectedAccountOperation.CREATE_CALENDAR_EVENT,
      }),
    ).toBe(false);
  });

  it('accepts a Google account once the calendar scope is granted', () => {
    expect(
      canConnectedAccountPerformOperation({
        connectedAccount: {
          provider: ConnectedAccountProvider.GOOGLE,
          scopes: ['email', GOOGLE_CALENDAR_EVENTS_SCOPE],
        },
        operation: ConnectedAccountOperation.CREATE_CALENDAR_EVENT,
      }),
    ).toBe(true);
  });

  it('refuses a Microsoft account until calendars can be written', () => {
    expect(
      canConnectedAccountPerformOperation({
        connectedAccount: {
          provider: ConnectedAccountProvider.MICROSOFT,
          scopes: ['Calendars.Read'],
        },
        operation: ConnectedAccountOperation.CREATE_CALENDAR_EVENT,
      }),
    ).toBe(false);
    expect(
      canConnectedAccountPerformOperation({
        connectedAccount: {
          provider: ConnectedAccountProvider.MICROSOFT,
          scopes: [MICROSOFT_CALENDARS_READ_WRITE_SCOPE],
        },
        operation: ConnectedAccountOperation.CREATE_CALENDAR_EVENT,
      }),
    ).toBe(true);
  });

  it('ignores scopes for providers that do not grant them', () => {
    expect(
      canConnectedAccountPerformOperation({
        connectedAccount: {
          provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
          scopes: null,
          connectionParameters: { CALDAV: {} },
        },
        operation: ConnectedAccountOperation.CREATE_CALENDAR_EVENT,
      }),
    ).toBe(true);
  });

  it('refuses calendar events on an account with no CalDAV settings', () => {
    expect(
      canConnectedAccountPerformOperation({
        connectedAccount: {
          provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
          connectionParameters: { IMAP: {}, SMTP: {} },
        },
        operation: ConnectedAccountOperation.CREATE_CALENDAR_EVENT,
      }),
    ).toBe(false);
  });

  it('requires SMTP settings to send from an IMAP account', () => {
    expect(
      canConnectedAccountPerformOperation({
        connectedAccount: {
          provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
          connectionParameters: { IMAP: {} },
        },
        operation: ConnectedAccountOperation.SEND_EMAIL,
      }),
    ).toBe(false);
  });

  it('requires IMAP settings to draft from an IMAP account', () => {
    expect(
      canConnectedAccountPerformOperation({
        connectedAccount: {
          provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
          connectionParameters: { SMTP: {} },
        },
        operation: ConnectedAccountOperation.DRAFT_EMAIL,
      }),
    ).toBe(false);
  });

  it('sends and drafts from an IMAP account that has both settings', () => {
    const connectedAccount = {
      provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
      connectionParameters: { IMAP: {}, SMTP: {} },
    };

    expect(
      canConnectedAccountPerformOperation({
        connectedAccount,
        operation: ConnectedAccountOperation.SEND_EMAIL,
      }),
    ).toBe(true);
    expect(
      canConnectedAccountPerformOperation({
        connectedAccount,
        operation: ConnectedAccountOperation.DRAFT_EMAIL,
      }),
    ).toBe(true);
  });
});

describe('canConnectedAccountCreateCalendarEvent', () => {
  it('keeps a Google account missing the calendar scope so it can be reconnected', () => {
    expect(
      canConnectedAccountCreateCalendarEvent({
        provider: ConnectedAccountProvider.GOOGLE,
        scopes: ['email'],
      }),
    ).toBe(true);
  });
});

describe('getMissingScopesForOperation', () => {
  it('names the scope to reconnect for', () => {
    expect(
      getMissingScopesForOperation({
        connectedAccount: {
          provider: ConnectedAccountProvider.GOOGLE,
          scopes: ['email'],
        },
        operation: ConnectedAccountOperation.CREATE_CALENDAR_EVENT,
      }),
    ).toEqual([GOOGLE_CALENDAR_EVENTS_SCOPE]);
    expect(
      getMissingScopesForOperation({
        connectedAccount: {
          provider: ConnectedAccountProvider.MICROSOFT,
          scopes: null,
        },
        operation: ConnectedAccountOperation.CREATE_CALENDAR_EVENT,
      }),
    ).toEqual([MICROSOFT_CALENDARS_READ_WRITE_SCOPE]);
  });

  it('reports nothing missing for an operation that needs no scope', () => {
    expect(
      getMissingScopesForOperation({
        connectedAccount: {
          provider: ConnectedAccountProvider.GOOGLE,
          scopes: [],
        },
        operation: ConnectedAccountOperation.SEND_EMAIL,
      }),
    ).toEqual([]);
  });
});
