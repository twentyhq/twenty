import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { STANDARD_TIMELINE_ACTIVITY_HAPPENS_AT_2_38 } from 'src/engine/metadata-modules/timeline-activity-type/constants/standard-timeline-activity-happens-at-2-38.constant';
import { STANDARD_TIMELINE_ACTIVITY_ROUTINGS_2_34 } from 'src/engine/metadata-modules/timeline-activity-type/constants/standard-timeline-activity-routing-2-34.constant';

type TimelineActivityTypeRouting = {
  targetRelationFieldUniversalIdentifier: string;
  triggerFieldUniversalIdentifiers: string[] | null;
  happensAtFieldUniversalIdentifier: string | null;
};

const STANDARD_ROUTING_BY_TIMELINE_ACTIVITY_TYPE_UNIVERSAL_IDENTIFIER = new Map<
  string,
  Omit<TimelineActivityTypeRouting, 'happensAtFieldUniversalIdentifier'>
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

const STANDARD_HAPPENS_AT_BY_TIMELINE_ACTIVITY_TYPE_UNIVERSAL_IDENTIFIER =
  new Map<string, string>(
    STANDARD_TIMELINE_ACTIVITY_HAPPENS_AT_2_38.map(
      (happensAt) =>
        [
          happensAt.universalIdentifier,
          happensAt.happensAtFieldUniversalIdentifier,
        ] as const,
    ),
  );

type ResolvableTimelineActivityTypeRoutingInput = {
  applicationUniversalIdentifier: string;
  universalIdentifier: string;
  targetRelationFieldUniversalIdentifier: string | null;
  triggerFieldUniversalIdentifiers: string[] | null;
  happensAtFieldUniversalIdentifier: string | null;
};

const resolveHappensAtFieldUniversalIdentifier = (
  timelineActivityType: ResolvableTimelineActivityTypeRoutingInput,
): string | null => {
  if (isDefined(timelineActivityType.happensAtFieldUniversalIdentifier)) {
    return timelineActivityType.happensAtFieldUniversalIdentifier;
  }

  // Standard rows can be served before their 2.38 workspace command runs.
  if (
    timelineActivityType.applicationUniversalIdentifier !==
    TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER
  ) {
    return null;
  }

  return (
    STANDARD_HAPPENS_AT_BY_TIMELINE_ACTIVITY_TYPE_UNIVERSAL_IDENTIFIER.get(
      timelineActivityType.universalIdentifier,
    ) ?? null
  );
};

export const resolveTimelineActivityTypeRouting = (
  timelineActivityType: ResolvableTimelineActivityTypeRoutingInput,
): TimelineActivityTypeRouting | undefined => {
  const happensAtFieldUniversalIdentifier =
    resolveHappensAtFieldUniversalIdentifier(timelineActivityType);

  if (isDefined(timelineActivityType.targetRelationFieldUniversalIdentifier)) {
    return {
      targetRelationFieldUniversalIdentifier:
        timelineActivityType.targetRelationFieldUniversalIdentifier,
      triggerFieldUniversalIdentifiers:
        timelineActivityType.triggerFieldUniversalIdentifiers,
      happensAtFieldUniversalIdentifier,
    };
  }

  // Standard rows can be served before their 2.34 workspace command runs.
  if (
    timelineActivityType.applicationUniversalIdentifier !==
    TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER
  ) {
    return undefined;
  }

  const standardRouting =
    STANDARD_ROUTING_BY_TIMELINE_ACTIVITY_TYPE_UNIVERSAL_IDENTIFIER.get(
      timelineActivityType.universalIdentifier,
    );

  return isDefined(standardRouting)
    ? { ...standardRouting, happensAtFieldUniversalIdentifier }
    : undefined;
};
