export type RecomputeRecordAccessGroupIdsJobData = {
  workspaceId: string;
  objectMetadataId: string;
  heldCompactIds: number[] | null;
};
