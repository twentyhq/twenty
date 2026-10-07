export const buildMessagesImportCacheKeys = ({
  workspaceId,
  messageChannelId,
}: {
  workspaceId: string;
  messageChannelId: string;
}) => ({
  messagesToImportKey: `messages-to-import:${workspaceId}:${messageChannelId}`,
  messagesToImportTotalKey: `messages-to-import-total:${workspaceId}:${messageChannelId}`,
  messagesImportedKey: `messages-imported:${workspaceId}:${messageChannelId}`,
});
