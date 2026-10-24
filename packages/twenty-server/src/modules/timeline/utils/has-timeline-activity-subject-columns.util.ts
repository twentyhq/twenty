import { type TimelineActivityTargetJoinColumn } from 'src/modules/timeline/types/timeline-activity-target-join-column.type';

export const hasTimelineActivitySubjectColumns = ({
  timelineActivity,
  targetJoinColumns,
}: {
  timelineActivity: Record<string, unknown>;
  targetJoinColumns: TimelineActivityTargetJoinColumn[];
}): boolean =>
  'linkedObjectMetadataId' in timelineActivity &&
  targetJoinColumns.every(
    ({ joinColumnName }) => joinColumnName in timelineActivity,
  );
