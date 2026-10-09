import { ConnectedAccountProvider } from '@/types';
import { getMissingCreateEventScopes } from '@/utils/connectedAccount/getMissingCreateEventScopes';

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

  it.each([
    [ConnectedAccountProvider.GOOGLE, GOOGLE_SCOPE],
    [ConnectedAccountProvider.MICROSOFT, MICROSOFT_SCOPE],
  ])('treats null scopes on %s as missing', (provider, scope) => {
    expect(getMissingCreateEventScopes({ provider, scopes: null })).toEqual([
      scope,
    ]);
  });

  it.each([
    ConnectedAccountProvider.IMAP_SMTP_CALDAV,
    ConnectedAccountProvider.EMAIL_GROUP,
    ConnectedAccountProvider.APP,
    ConnectedAccountProvider.OIDC,
    ConnectedAccountProvider.SAML,
  ])('does not require OAuth scopes for %s accounts', (provider) => {
    expect(getMissingCreateEventScopes({ provider, scopes: null })).toEqual([]);
  });
});
