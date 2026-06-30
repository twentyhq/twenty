import { ConnectedAccountProvider } from 'twenty-shared/types';

import { getMissingCreateEventScopes } from 'src/modules/calendar/calendar-event-creation-manager/utils/get-missing-create-event-scopes.util';

const GOOGLE_SCOPE = 'https://www.googleapis.com/auth/calendar.events';
const MICROSOFT_SCOPE = 'Calendars.ReadWrite';

describe('getMissingCreateEventScopes', () => {
  it('returns no missing scope when Google has calendar.events', () => {
    expect(
      getMissingCreateEventScopes({
        provider: ConnectedAccountProvider.GOOGLE,
        scopes: ['email', GOOGLE_SCOPE],
      }),
    ).toEqual([]);
  });

  it('reports the Google calendar.events scope when missing', () => {
    expect(
      getMissingCreateEventScopes({
        provider: ConnectedAccountProvider.GOOGLE,
        scopes: ['email'],
      }),
    ).toEqual([GOOGLE_SCOPE]);
  });

  it('returns no missing scope when Microsoft has Calendars.ReadWrite', () => {
    expect(
      getMissingCreateEventScopes({
        provider: ConnectedAccountProvider.MICROSOFT,
        scopes: [MICROSOFT_SCOPE],
      }),
    ).toEqual([]);
  });

  it('reports the Microsoft Calendars.ReadWrite scope when missing', () => {
    expect(
      getMissingCreateEventScopes({
        provider: ConnectedAccountProvider.MICROSOFT,
        scopes: ['Calendars.Read'],
      }),
    ).toEqual([MICROSOFT_SCOPE]);
  });

  it('treats null scopes as missing', () => {
    expect(
      getMissingCreateEventScopes({
        provider: ConnectedAccountProvider.GOOGLE,
        scopes: null,
      }),
    ).toEqual([GOOGLE_SCOPE]);
  });

  it('does not require OAuth scopes for non-OAuth providers', () => {
    expect(
      getMissingCreateEventScopes({
        provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
        scopes: null,
      }),
    ).toEqual([]);
  });
});
