export type AgentChatThreadInboxStatus = {
  // NONE: a chat the member can open but does not follow
  scope: 'INBOX' | 'SNOOZED' | 'ARCHIVED' | 'NONE';
  isUnread: boolean;
  isSubscribed: boolean;
  isMentioned: boolean;
  isAssignedToMe: boolean;
  // The scope is the channel's shared copy, as in the channel's own view
  isChannelCopy: boolean;
  // The latest inbox change the member made, shown on the row and in the chat
  event: {
    type: 'SNOOZED' | 'SNOOZE_ENDED' | 'DONE' | 'UNSUBSCRIBED';
    at: string;
  } | null;
};
