import {
  ConnectedAccountProvider,
  type ConnectedAccountOperationFields,
} from '@/types';
import { assertUnreachable } from '@/utils/assertUnreachable';

const GOOGLE_CALENDAR_EVENTS_SCOPE =
  'https://www.googleapis.com/auth/calendar.events';
const MICROSOFT_CALENDARS_READ_WRITE_SCOPE = 'Calendars.ReadWrite';

export const getMissingCalendarEventScopes = (
  connectedAccount: Pick<
    ConnectedAccountOperationFields,
    'provider' | 'scopes'
  >,
): string[] => {
  const scopes = connectedAccount.scopes ?? [];

  switch (connectedAccount.provider) {
    case ConnectedAccountProvider.GOOGLE:
      return scopes.includes(GOOGLE_CALENDAR_EVENTS_SCOPE)
        ? []
        : [GOOGLE_CALENDAR_EVENTS_SCOPE];
    case ConnectedAccountProvider.MICROSOFT:
      return scopes.includes(MICROSOFT_CALENDARS_READ_WRITE_SCOPE)
        ? []
        : [MICROSOFT_CALENDARS_READ_WRITE_SCOPE];
    case ConnectedAccountProvider.IMAP_SMTP_CALDAV:
    case ConnectedAccountProvider.EMAIL_GROUP:
    case ConnectedAccountProvider.OIDC:
    case ConnectedAccountProvider.SAML:
    case ConnectedAccountProvider.APP:
      return [];
    default:
      return assertUnreachable(
        connectedAccount.provider,
        `Unhandled connected account provider: ${connectedAccount.provider}`,
      );
  }
};
