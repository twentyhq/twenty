export type InboxMessageAddressing =
  | { threadKey: string; title: string; channelId?: string }
  | { threadId: string };
