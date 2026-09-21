import { ConnectedAccountOperation, ConnectedAccountProvider } from '@/types';
import { canConnectedAccountPerformOperation } from '@/utils/connected-account/canConnectedAccountPerformOperation';
import { getMissingScopesForOperation } from '@/utils/connected-account/getMissingScopesForOperation';

const GOOGLE_CALENDAR_EVENTS_SCOPE =
  'https://www.googleapis.com/auth/calendar.events';

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
