import { isNonEmptyString } from '@sniptt/guards';

import { type TimelineActivityTargetJoinColumn } from 'src/modules/timeline/types/timeline-activity-target-join-column.type';

export const resolveTimelineActivitySubjectObjectMetadataId = ({
  timelineActivity,
  targetJoinColumns,
}: {
  timelineActivity: Record<string, unknown>;
  targetJoinColumns: TimelineActivityTargetJoinColumn[];
}): string | undefined => {
  if (isNonEmptyString(timelineActivity.linkedObjectMetadataId)) {
    return timelineActivity.linkedObjectMetadataId;
  }

  return targetJoinColumns.find(({ joinColumnName }) =>
    isNonEmptyString(timelineActivity[joinColumnName]),
  )?.objectMetadataId;
};
