import { GMAIL_COMPOSE_SCOPE } from '@/constants/GmailComposeScope';
import {
  type ConnectedAccountPermission,
  ConnectedAccountProvider,
} from '@/types';

export const CONNECTED_ACCOUNT_PERMISSION_SCOPES = {
  READ_EMAILS: {
    [ConnectedAccountProvider.GOOGLE]: [
      'https://www.googleapis.com/auth/gmail.readonly',
    ],
    [ConnectedAccountProvider.MICROSOFT]: ['Mail.ReadWrite'],
  },
  SEND_EMAILS: {
    [ConnectedAccountProvider.GOOGLE]: [
      'https://www.googleapis.com/auth/gmail.send',
      GMAIL_COMPOSE_SCOPE,
    ],
    [ConnectedAccountProvider.MICROSOFT]: ['Mail.Send'],
  },
  MANAGE_EVENTS: {
    [ConnectedAccountProvider.GOOGLE]: [
      'https://www.googleapis.com/auth/calendar.events',
    ],
    [ConnectedAccountProvider.MICROSOFT]: ['Calendars.ReadWrite'],
  },
} as const satisfies Record<
  ConnectedAccountPermission,
  Record<
    ConnectedAccountProvider.GOOGLE | ConnectedAccountProvider.MICROSOFT,
    readonly string[]
  >
>;
