export type PermissionTestTimelineRecordName =
  | 'insideEveryFilter'
  | 'outsideStatusFilter'
  | 'lowVisibilityTier'
  | 'fullVisibilityTier'
  | 'privateRecord'
  | 'itemOfReadableRecord'
  | 'itemOfUnreadableRecord';

export type PermissionTestTimelineFieldName = 'name' | 'summary';

export type PermissionTestTimelineRole =
  | 'allRecords'
  | 'rowLevel'
  | 'objectDenied'
  | 'summaryDenied'
  | 'timelineRelationDenied'
  | 'sharedRecord'
  | 'lowVisibilityTier';

export type PermissionTestTimelineFixture = {
  timelineActivityIdsByRecord: Record<
    PermissionTestTimelineRecordName,
    string[]
  >;
  targetColumnNameByRecord: Record<PermissionTestTimelineRecordName, string>;
  tokens: Record<PermissionTestTimelineRole, string>;
};
