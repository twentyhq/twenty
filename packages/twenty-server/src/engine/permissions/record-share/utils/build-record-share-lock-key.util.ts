export const buildRecordShareLockKey = ({
  workspaceId,
  objectMetadataId,
  recordId,
}: {
  workspaceId: string;
  objectMetadataId: string;
  recordId: string;
}): string => `record-share:${workspaceId}:${objectMetadataId}:${recordId}`;
