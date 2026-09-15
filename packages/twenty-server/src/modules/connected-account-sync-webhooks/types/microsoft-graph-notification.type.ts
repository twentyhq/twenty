import { type ChangeNotification } from '@microsoft/microsoft-graph-types';

export type MicrosoftGraphNotification = Omit<
  ChangeNotification,
  'subscriptionId'
> & {
  subscriptionId: string;
};

export type MicrosoftGraphNotificationPayload = {
  value?: MicrosoftGraphNotification[];
};
