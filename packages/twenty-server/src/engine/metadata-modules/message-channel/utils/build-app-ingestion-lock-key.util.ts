// per channel because dedup never spans channels; workspace-qualified so one workspace's ingestion cannot stall another's
export const buildAppIngestionLockKey = ({
  workspaceId,
  messageChannelId,
}: {
  workspaceId: string;
  messageChannelId: string;
}): string => `app-message-ingestion:${workspaceId}:${messageChannelId}`;
