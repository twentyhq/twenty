import { ConnectedAccountProvider } from '@/types';

export const EMAIL_SENDING_PROVIDERS: ConnectedAccountProvider[] = [
  ConnectedAccountProvider.GOOGLE,
  ConnectedAccountProvider.MICROSOFT,
  ConnectedAccountProvider.IMAP_SMTP_CALDAV,
  ConnectedAccountProvider.EMAIL_GROUP,
];
