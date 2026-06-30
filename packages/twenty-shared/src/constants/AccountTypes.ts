export const ACCOUNT_TYPES = ['IMAP', 'SMTP', 'CALDAV'] as const;

export type AccountType = (typeof ACCOUNT_TYPES)[number];
