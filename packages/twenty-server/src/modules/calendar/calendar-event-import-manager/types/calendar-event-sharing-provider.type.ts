import { type ConnectedAccountProvider } from 'twenty-shared/types';

export type CalendarEventSharingProvider =
  | ConnectedAccountProvider.GOOGLE
  | ConnectedAccountProvider.MICROSOFT;
