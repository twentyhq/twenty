export const getAgentChatPushNotificationTag = (threadId: string): string =>
  `inbox-${threadId}`;
