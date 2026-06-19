export const MICROSOFT_SUBSCRIPTION_TTL_MINUTES = 10000;

export const GOOGLE_CALENDAR_WATCH_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export const WEBHOOK_SUBSCRIPTION_RENEWAL_CRON_PATTERN = '0 * * * *';

export const WEBHOOK_SUBSCRIPTION_RENEWAL_BUFFER_MS = 24 * 60 * 60 * 1000;

export const WEBHOOK_SUBSCRIPTION_ROUTE_PATHS = {
  GOOGLE_MESSAGING: 'webhooks/google/messaging',
  GOOGLE_CALENDAR: 'webhooks/google/calendar',
  MICROSOFT_MESSAGING: 'webhooks/microsoft/messaging',
  MICROSOFT_CALENDAR: 'webhooks/microsoft/calendar',
} as const;
