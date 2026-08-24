import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { STANDARD_TIMELINE_ACTIVITY_ROUTINGS_2_34 } from 'src/engine/metadata-modules/timeline-activity-type/constants/standard-timeline-activity-routing-2-34.constant';

type TimelineActivityTypeRouting = {
  targetRelationFieldUniversalIdentifier: string;
  triggerFieldUniversalIdentifiers: string[] | null;
};

const STANDARD_ROUTING_BY_TIMELINE_ACTIVITY_TYPE_UNIVERSAL_IDENTIFIER = new Map<
  string,
  TimelineActivityTypeRouting
>(
  STANDARD_TIMELINE_ACTIVITY_ROUTINGS_2_34.map(
    (routing) =>
      [
        routing.universalIdentifier,
        {
          targetRelationFieldUniversalIdentifier:
            routing.targetRelationFieldUniversalIdentifier,
          triggerFieldUniversalIdentifiers: isDefined(
            routing.triggerFieldUniversalIdentifiers,
          )
            ? [...routing.triggerFieldUniversalIdentifiers]
            : null,
        },
      ] as const,
  ),
);

export const resolveTimelineActivityTypeRouting = (timelineActivityType: {
  applicationUniversalIdentifier: string;
  universalIdentifier: string;
  targetRelationFieldUniversalIdentifier: string | null;
  triggerFieldUniversalIdentifiers: string[] | null;
}): TimelineActivityTypeRouting | undefined => {
  if (isDefined(timelineActivityType.targetRelationFieldUniversalIdentifier)) {
    return {
      targetRelationFieldUniversalIdentifier:
        timelineActivityType.targetRelationFieldUniversalIdentifier,
      triggerFieldUniversalIdentifiers:
        timelineActivityType.triggerFieldUniversalIdentifiers,
    };
  }

  // Standard rows can be served before their 2.34 workspace command runs.
  if (
    timelineActivityType.applicationUniversalIdentifier !==
    TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER
  ) {
    return undefined;
  }

  return STANDARD_ROUTING_BY_TIMELINE_ACTIVITY_TYPE_UNIVERSAL_IDENTIFIER.get(
    timelineActivityType.universalIdentifier,
  );
};
