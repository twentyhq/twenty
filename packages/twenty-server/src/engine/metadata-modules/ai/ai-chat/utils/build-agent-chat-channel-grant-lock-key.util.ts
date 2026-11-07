export const buildAgentChatChannelGrantLockKey = ({
  workspaceId,
  channelId,
}: {
  workspaceId: string;
  channelId: string;
}): string => `agent-chat-channel-grants:${workspaceId}:${channelId}`;
