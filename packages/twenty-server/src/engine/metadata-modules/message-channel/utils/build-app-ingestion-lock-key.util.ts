// Scoped to the channel because that is the scope dedup works at: two channels
// never share a headerMessageId, so serialising them against each other would
// only add contention. Workspace-qualified so one workspace's ingestion cannot
// stall another's.
export const buildAppIngestionLockKey = ({
  workspaceId,
  messageChannelId,
}: {
  workspaceId: string;
  messageChannelId: string;
}): string => `app-message-ingestion:${workspaceId}:${messageChannelId}`;
