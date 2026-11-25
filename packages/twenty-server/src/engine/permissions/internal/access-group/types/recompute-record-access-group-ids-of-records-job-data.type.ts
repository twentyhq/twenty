export type RecomputeRecordAccessGroupIdsOfRecordsJobData = {
  workspaceId: string;
  objectMetadataId: string;
  recordIds: string[];
  fromRelatedObjectMetadataIds?: string[];
};
