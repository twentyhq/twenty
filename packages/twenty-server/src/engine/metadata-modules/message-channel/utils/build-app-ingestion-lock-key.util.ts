// per channel because dedup never spans channels
export const buildAppIngestionLockKey = ({
  workspaceId,
  messageChannelId,
}: {
  workspaceId: string;
  messageChannelId: string;
}): string => `app-message-ingestion:${workspaceId}:${messageChannelId}`;
