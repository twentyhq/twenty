export type AgentChatChannelGrantScope =
  | { threadIds: string[] }
  | { channelId: string };
