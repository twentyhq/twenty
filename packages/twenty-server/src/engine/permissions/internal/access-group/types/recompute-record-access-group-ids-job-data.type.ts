export type RecomputeRecordAccessGroupIdsJobData = {
  workspaceId: string;
  objectMetadataId: string;
  // Objects whose recompute led to this one, so paths saved as a cycle stop propagating
  propagatedFromObjectMetadataIds?: string[];
};
