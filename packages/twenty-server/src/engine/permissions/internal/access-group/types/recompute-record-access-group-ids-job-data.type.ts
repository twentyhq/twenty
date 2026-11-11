export type RecomputeRecordAccessGroupIdsJobData = {
  workspaceId: string;
  objectMetadataId: string;
  // Set when only the groups inherited through related record paths can have changed
  isPropagatedThroughRelatedRecordPath?: boolean;
};
