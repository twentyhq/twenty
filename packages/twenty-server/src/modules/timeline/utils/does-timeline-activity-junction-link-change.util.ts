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
  const { updatedFields, diff } = event.properties;

  const joinColumnNames = [
    targetShape.junctionSourceJoinColumnName,
    ...targetShape.junctionTargetJoinColumns.map(
      ({ joinColumnName }) => joinColumnName,
    ),
  ];

  if (isDefined(updatedFields)) {
    return joinColumnNames.some((joinColumnName) =>
      updatedFields.includes(joinColumnName),
    );
  }

  if (!isDefined(diff)) {
    return false;
  }

  return joinColumnNames.some((joinColumnName) =>
    Object.prototype.hasOwnProperty.call(diff, joinColumnName),
  );
};
