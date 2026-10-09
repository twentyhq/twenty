import {
  type ConnectedAccountPermission,
  ConnectedAccountProvider,
} from '@/types';
import { getConnectedAccountPermissionScopes } from '@/utils/connectedAccount/getConnectedAccountPermissionScopes';

describe('getConnectedAccountPermissionScopes', () => {
  it.each<[ConnectedAccountPermission, ConnectedAccountProvider, string[]]>([
    [
      'READ_EMAILS',
      ConnectedAccountProvider.GOOGLE,
      ['https://www.googleapis.com/auth/gmail.readonly'],
    ],
    [
      'SEND_EMAILS',
      ConnectedAccountProvider.GOOGLE,
      [
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/gmail.compose',
      ],
    ],
    [
      'MANAGE_EVENTS',
      ConnectedAccountProvider.GOOGLE,
      ['https://www.googleapis.com/auth/calendar.events'],
    ],
    ['READ_EMAILS', ConnectedAccountProvider.MICROSOFT, ['Mail.ReadWrite']],
    ['SEND_EMAILS', ConnectedAccountProvider.MICROSOFT, ['Mail.Send']],
    [
      'MANAGE_EVENTS',
      ConnectedAccountProvider.MICROSOFT,
      ['Calendars.ReadWrite'],
    ],
  ])('maps %s on %s to its OAuth scopes', (permission, provider, scopes) => {
    expect(
      getConnectedAccountPermissionScopes({ permission, provider }),
    ).toEqual(scopes);
  });

  it.each([
    ConnectedAccountProvider.IMAP_SMTP_CALDAV,
    ConnectedAccountProvider.EMAIL_GROUP,
    ConnectedAccountProvider.APP,
    ConnectedAccountProvider.OIDC,
    ConnectedAccountProvider.SAML,
  ])('has no OAuth scopes for %s accounts', (provider) => {
    expect(
      getConnectedAccountPermissionScopes({
        permission: 'SEND_EMAILS',
        provider,
      }),
    ).toEqual([]);
  });
});
