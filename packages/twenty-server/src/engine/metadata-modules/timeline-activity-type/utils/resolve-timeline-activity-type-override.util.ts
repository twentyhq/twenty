import { isDefined } from 'twenty-shared/utils';

type TimelineActivityTypeOverride = {
  universalIdentifier: string;
  overridesTimelineActivityTypeUniversalIdentifier: string | null;
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
        timelineActivityType.overridesTimelineActivityTypeUniversalIdentifier,
      ) ||
      allTimelineActivityTypeUniversalIdentifiers.has(
        timelineActivityType.overridesTimelineActivityTypeUniversalIdentifier,
      ),
  );
  const overriddenUniversalIdentifiers = new Set(
    validCandidates
      .map(
        (timelineActivityType) =>
          timelineActivityType.overridesTimelineActivityTypeUniversalIdentifier,
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
