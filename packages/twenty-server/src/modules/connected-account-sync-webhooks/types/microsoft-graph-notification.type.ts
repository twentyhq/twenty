export type MicrosoftGraphNotification = {
  subscriptionId: string;
  clientState?: string;
  changeType?: string;
  resource?: string;
  lifecycleEvent?: string;
  resourceData?: { id?: string } | null;
};

export type MicrosoftGraphNotificationPayload = {
  value?: MicrosoftGraphNotification[];
};
