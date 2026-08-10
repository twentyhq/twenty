export const getMessagesToImportCacheKey = ({
  workspaceId,
  messageChannelId,
}: {
  workspaceId: string;
  messageChannelId: string;
}) => `messages-to-import:${workspaceId}:${messageChannelId}`;
