export type ResolvedFieldValueSnapshotField = {
  snapshotFieldName: string;
  subjectObjectMetadataIdFieldName: string;
  subjectJoinColumns: { joinColumnName: string; objectMetadataId: string }[];
};
