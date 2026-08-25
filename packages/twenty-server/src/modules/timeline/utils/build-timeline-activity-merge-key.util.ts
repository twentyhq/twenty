import { type TimelineActivityTypeSnapshot } from 'twenty-shared/timeline';

type TimelineActivityMergeKeyArgs = {
  recordId: string;
  workspaceMemberId: string | null | undefined;
  timelineActivityTypeId: string;
  timelineActivityTypeSnapshot: TimelineActivityTypeSnapshot;
};

export const buildTimelineActivityMergeKey = ({
  recordId,
  workspaceMemberId,
  timelineActivityTypeId,
  timelineActivityTypeSnapshot,
}: TimelineActivityMergeKeyArgs): string =>
  JSON.stringify([
    recordId,
    workspaceMemberId ?? null,
    timelineActivityTypeId,
    timelineActivityTypeSnapshot.universalIdentifier,
    timelineActivityTypeSnapshot.action,
    timelineActivityTypeSnapshot.objectUniversalIdentifier,
  ]);
