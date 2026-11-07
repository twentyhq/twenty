export type RecomputeAccessGroupIdsJobData = {
  workspaceId: string;
  objectMetadataId: string;
  heldCompactIds: number[] | null;
};
