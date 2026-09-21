import { isDefined } from 'twenty-shared/utils';

type TimelineActivityTypeOverrideContract = {
  action: string | null;
  applicationUniversalIdentifier: string;
  objectUniversalIdentifier: string | null;
  targetRelationFieldUniversalIdentifier: string | null;
  triggerFieldUniversalIdentifiers: string[] | null;
  replacesTimelineActivityTypeUniversalIdentifier: string | null;
};

type ObjectOwner = {
  applicationUniversalIdentifier: string;
};

const containSameValues = (
  firstValues: string[] | null,
  secondValues: string[] | null,
): boolean => {
  if (!isDefined(firstValues) || !isDefined(secondValues)) {
    return firstValues === secondValues;
  }

  const firstValueSet = new Set(firstValues);
  const secondValueSet = new Set(secondValues);

  return (
    firstValueSet.size === secondValueSet.size &&
    [...firstValueSet].every((value) => secondValueSet.has(value))
  );
};

export const isValidTimelineActivityTypeOverride = ({
  timelineActivityType,
  objectOwner,
  overriddenTimelineActivityType,
}: {
  timelineActivityType: TimelineActivityTypeOverrideContract;
  objectOwner: ObjectOwner | undefined;
  overriddenTimelineActivityType:
    | TimelineActivityTypeOverrideContract
    | undefined;
}): boolean => {
  if (
    isDefined(timelineActivityType.objectUniversalIdentifier) &&
    !isDefined(objectOwner)
  ) {
    return false;
  }

  const targetsAnotherApplication =
    isDefined(objectOwner) &&
    objectOwner.applicationUniversalIdentifier !==
      timelineActivityType.applicationUniversalIdentifier;
  const overrideUniversalIdentifier =
    timelineActivityType.replacesTimelineActivityTypeUniversalIdentifier;

  if (!isDefined(timelineActivityType.action)) {
    return !isDefined(overrideUniversalIdentifier);
  }

  if (!targetsAnotherApplication) {
    return !isDefined(overrideUniversalIdentifier);
  }

  return (
    isDefined(overrideUniversalIdentifier) &&
    isDefined(overriddenTimelineActivityType) &&
    overriddenTimelineActivityType.applicationUniversalIdentifier ===
      objectOwner.applicationUniversalIdentifier &&
    overriddenTimelineActivityType.action === timelineActivityType.action &&
    (!isDefined(overriddenTimelineActivityType.objectUniversalIdentifier) ||
      overriddenTimelineActivityType.objectUniversalIdentifier ===
        timelineActivityType.objectUniversalIdentifier) &&
    overriddenTimelineActivityType.targetRelationFieldUniversalIdentifier ===
      timelineActivityType.targetRelationFieldUniversalIdentifier &&
    containSameValues(
      overriddenTimelineActivityType.triggerFieldUniversalIdentifiers,
      timelineActivityType.triggerFieldUniversalIdentifiers,
    )
  );
};

export const partitionTimelineActivityTypesByValidity = <
  TTimelineActivityType extends TimelineActivityTypeOverrideContract & {
    universalIdentifier: string;
  },
>({
  timelineActivityTypes,
  objectMetadataByUniversalIdentifier,
  timelineActivityTypeByUniversalIdentifier,
}: {
  timelineActivityTypes: TTimelineActivityType[];
  objectMetadataByUniversalIdentifier: Partial<Record<string, ObjectOwner>>;
  timelineActivityTypeByUniversalIdentifier: Partial<
    Record<string, TTimelineActivityType>
  >;
}): {
  validTimelineActivityTypes: TTimelineActivityType[];
  invalidTimelineActivityTypes: TTimelineActivityType[];
} => {
  const validTimelineActivityTypes: TTimelineActivityType[] = [];
  const invalidTimelineActivityTypes: TTimelineActivityType[] = [];

  for (const timelineActivityType of timelineActivityTypes) {
    const isValid = isValidTimelineActivityTypeOverride({
      timelineActivityType,
      objectOwner: isDefined(timelineActivityType.objectUniversalIdentifier)
        ? objectMetadataByUniversalIdentifier[
            timelineActivityType.objectUniversalIdentifier
          ]
        : undefined,
      overriddenTimelineActivityType: isDefined(
        timelineActivityType.replacesTimelineActivityTypeUniversalIdentifier,
      )
        ? timelineActivityTypeByUniversalIdentifier[
            timelineActivityType.replacesTimelineActivityTypeUniversalIdentifier
          ]
        : undefined,
    });

    (isValid ? validTimelineActivityTypes : invalidTimelineActivityTypes).push(
      timelineActivityType,
    );
  }

  return { validTimelineActivityTypes, invalidTimelineActivityTypes };
};
