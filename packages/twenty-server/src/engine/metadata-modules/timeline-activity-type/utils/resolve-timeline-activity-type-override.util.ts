import { isDefined } from 'twenty-shared/utils';

type TimelineActivityTypeOverride = {
  universalIdentifier: string;
  replacesTimelineActivityTypeUniversalIdentifier: string | null;
};

export const resolveTimelineActivityTypeOverride = <
  TTimelineActivityType extends TimelineActivityTypeOverride,
>(
  timelineActivityTypes: TTimelineActivityType[],
  allTimelineActivityTypeUniversalIdentifiers: ReadonlySet<string>,
): TTimelineActivityType | undefined => {
  const validCandidates = timelineActivityTypes.filter(
    (timelineActivityType) =>
      !isDefined(
        timelineActivityType.replacesTimelineActivityTypeUniversalIdentifier,
      ) ||
      allTimelineActivityTypeUniversalIdentifiers.has(
        timelineActivityType.replacesTimelineActivityTypeUniversalIdentifier,
      ),
  );
  const overriddenUniversalIdentifiers = new Set(
    validCandidates
      .map(
        (timelineActivityType) =>
          timelineActivityType.replacesTimelineActivityTypeUniversalIdentifier,
      )
      .filter(isDefined),
  );
  const effectiveCandidates = validCandidates.filter(
    (timelineActivityType) =>
      !overriddenUniversalIdentifiers.has(
        timelineActivityType.universalIdentifier,
      ),
  );

  return effectiveCandidates.length === 1 ? effectiveCandidates[0] : undefined;
};
