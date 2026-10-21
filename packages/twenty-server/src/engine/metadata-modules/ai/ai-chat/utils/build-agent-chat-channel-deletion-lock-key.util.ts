export const buildAgentChatChannelDeletionLockKey = ({
  workspaceId,
  channelId,
}: {
  workspaceId: string;
  channelId: string;
}): string => `agent-chat-channel-deletion:${workspaceId}:${channelId}`;
