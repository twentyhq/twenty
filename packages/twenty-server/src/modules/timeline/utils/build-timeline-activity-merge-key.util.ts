import { type TimelineActivityTypeSnapshot } from 'twenty-shared/timeline';

export const buildTimelineActivityMergeKey = ({
  recordId,
  workspaceMemberId,
  timelineActivityTypeId,
  timelineActivityTypeSnapshot,
}: {
  recordId: string;
  workspaceMemberId: string | null | undefined;
  timelineActivityTypeId: string;
  timelineActivityTypeSnapshot: TimelineActivityTypeSnapshot | null;
}): string =>
  JSON.stringify([
    recordId,
    workspaceMemberId ?? null,
    timelineActivityTypeId,
    timelineActivityTypeSnapshot?.universalIdentifier,
    timelineActivityTypeSnapshot?.action,
    timelineActivityTypeSnapshot?.objectUniversalIdentifier,
  ]);
