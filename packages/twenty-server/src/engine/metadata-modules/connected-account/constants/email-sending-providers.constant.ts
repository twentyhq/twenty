import { ConnectedAccountProvider } from 'twenty-shared/types';

export const EMAIL_SENDING_PROVIDERS: ConnectedAccountProvider[] = [
  ConnectedAccountProvider.GOOGLE,
  ConnectedAccountProvider.MICROSOFT,
  ConnectedAccountProvider.IMAP_SMTP_CALDAV,
  ConnectedAccountProvider.EMAIL_GROUP,
];
