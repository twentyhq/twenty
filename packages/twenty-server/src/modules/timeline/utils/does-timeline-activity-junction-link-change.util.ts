import { type ObjectRecordBaseEvent } from 'twenty-shared/database-events';
import { isDefined } from 'twenty-shared/utils';

import { type TimelineActivityRuleTargetShape } from 'src/modules/timeline/types/timeline-activity-rule-target-shape.type';

export const doesTimelineActivityJunctionLinkChange = ({
  event,
  targetShape,
}: {
  event: ObjectRecordBaseEvent;
  targetShape: Extract<TimelineActivityRuleTargetShape, { kind: 'JUNCTION' }>;
}): boolean => {
  const diff = event.properties.diff;

  if (!isDefined(diff)) {
    return false;
  }

  return [
    targetShape.junctionSourceJoinColumnName,
    ...targetShape.junctionTargetJoinColumns.map(
      ({ joinColumnName }) => joinColumnName,
    ),
  ].some((joinColumnName) =>
    Object.prototype.hasOwnProperty.call(diff, joinColumnName),
  );
};
