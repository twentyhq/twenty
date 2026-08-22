import {
  type TimelineActivityAction,
  type TimelineActivityTypeSnapshot,
} from 'twenty-shared/timeline';
import { isDefined } from 'twenty-shared/utils';

import { type FlatTimelineActivityType } from 'src/engine/metadata-modules/flat-timeline-activity-type/types/flat-timeline-activity-type.type';
import { resolveOverridableEntityProperty } from 'src/engine/metadata-modules/utils/resolve-overridable-entity-property.util';
import { partitionTimelineActivityTypesByValidity } from 'src/engine/metadata-modules/timeline-activity-type/utils/is-valid-timeline-activity-type-override.util';
import { resolveTimelineActivityTypeOverride } from 'src/engine/metadata-modules/timeline-activity-type/utils/resolve-timeline-activity-type-override.util';

type ResolvableTimelineActivityType = Pick<
  FlatTimelineActivityType,
  | 'id'
  | 'applicationId'
  | 'applicationUniversalIdentifier'
  | 'universalIdentifier'
  | 'name'
  | 'label'
  | 'action'
  | 'icon'
  | 'objectUniversalIdentifier'
  | 'targetRelationFieldUniversalIdentifier'
  | 'triggerFieldUniversalIdentifiers'
  | 'frontComponentUniversalIdentifier'
  | 'overridesTimelineActivityTypeUniversalIdentifier'
  | 'isActive'
  | 'overrides'
>;

export type TimelineActivityTypeResolutionMaps = {
  byUniversalIdentifier: Partial<
    Record<string, ResolvableTimelineActivityType>
  >;
  objectMetadataByUniversalIdentifier: Partial<
    Record<string, { applicationUniversalIdentifier: string }>
  >;
};

export type ResolveTimelineActivityTypeArgs = {
  action: TimelineActivityAction;
  objectUniversalIdentifier?: string | null;
};

export type ResolvedTimelineActivityType = {
  id: string;
  applicationId: string;
  snapshot: TimelineActivityTypeSnapshot;
};

export type TimelineActivityTypeResolutionConflict = {
  action: TimelineActivityAction;
  objectUniversalIdentifier: string | null;
};

export type TimelineActivityTypeResolver = (
  args: ResolveTimelineActivityTypeArgs,
) => ResolvedTimelineActivityType | undefined;

export type TimelineActivityTypeResolution = {
  resolveTimelineActivityType: TimelineActivityTypeResolver;
  conflicts: TimelineActivityTypeResolutionConflict[];
  invalidContracts: TimelineActivityTypeResolutionConflict[];
};

export const toResolvedTimelineActivityType = (
  timelineActivityType: ResolvableTimelineActivityType,
): ResolvedTimelineActivityType => ({
  id: timelineActivityType.id,
  applicationId: timelineActivityType.applicationId,
  snapshot: {
    id: timelineActivityType.id,
    universalIdentifier: timelineActivityType.universalIdentifier,
    name: timelineActivityType.name,
    label: resolveOverridableEntityProperty(timelineActivityType, 'label'),
    action: timelineActivityType.action,
    icon: resolveOverridableEntityProperty(timelineActivityType, 'icon'),
    objectUniversalIdentifier: timelineActivityType.objectUniversalIdentifier,
    frontComponentUniversalIdentifier:
      timelineActivityType.frontComponentUniversalIdentifier,
  },
});

export const buildResolvedTimelineActivityTypeResolver = (
  flatTimelineActivityTypeMaps: TimelineActivityTypeResolutionMaps,
): TimelineActivityTypeResolution => {
  const candidatesByObjectAndAction = new Map<
    string,
    ResolvableTimelineActivityType[]
  >();
  const candidatesByAction = new Map<
    TimelineActivityAction,
    ResolvableTimelineActivityType[]
  >();
  const allUnvalidatedTimelineActivityTypes = Object.values(
    flatTimelineActivityTypeMaps.byUniversalIdentifier,
  ).filter(isDefined);
  const timelineActivityTypeByUniversalIdentifier = Object.fromEntries(
    allUnvalidatedTimelineActivityTypes.map((timelineActivityType) => [
      timelineActivityType.universalIdentifier,
      timelineActivityType,
    ]),
  );
  const {
    validTimelineActivityTypes: allTimelineActivityTypes,
    invalidTimelineActivityTypes,
  } = partitionTimelineActivityTypesByValidity({
    timelineActivityTypes: allUnvalidatedTimelineActivityTypes,
    objectMetadataByUniversalIdentifier:
      flatTimelineActivityTypeMaps.objectMetadataByUniversalIdentifier,
    timelineActivityTypeByUniversalIdentifier,
  });
  const allTimelineActivityTypeUniversalIdentifiers = new Set(
    allTimelineActivityTypes.map(
      (timelineActivityType) => timelineActivityType.universalIdentifier,
    ),
  );

  for (const timelineActivityType of allTimelineActivityTypes) {
    if (
      !isDefined(timelineActivityType.action) ||
      isDefined(timelineActivityType.targetRelationFieldUniversalIdentifier)
    ) {
      continue;
    }

    const { action, objectUniversalIdentifier } = timelineActivityType;

    if (!isDefined(objectUniversalIdentifier)) {
      candidatesByAction.set(action, [
        ...(candidatesByAction.get(action) ?? []),
        timelineActivityType,
      ]);

      continue;
    }

    const key = `${objectUniversalIdentifier}|${action}`;

    candidatesByObjectAndAction.set(key, [
      ...(candidatesByObjectAndAction.get(key) ?? []),
      timelineActivityType,
    ]);
  }

  const conflicts: TimelineActivityTypeResolutionConflict[] = [];
  const typeByAction = new Map<
    TimelineActivityAction,
    ResolvedTimelineActivityType
  >();
  const typeByObjectAndAction = new Map<string, ResolvedTimelineActivityType>();
  const conflictedObjectAndActionKeys = new Set<string>();
  const suppressedObjectAndActionKeys = new Set<string>();

  for (const [action, candidates] of candidatesByAction) {
    const effectiveTimelineActivityType = resolveTimelineActivityTypeOverride(
      candidates,
      allTimelineActivityTypeUniversalIdentifiers,
    );

    if (effectiveTimelineActivityType?.isActive === true) {
      typeByAction.set(
        action,
        toResolvedTimelineActivityType(effectiveTimelineActivityType),
      );
    } else if (!isDefined(effectiveTimelineActivityType)) {
      conflicts.push({ action, objectUniversalIdentifier: null });
    }
  }

  for (const [key, candidates] of candidatesByObjectAndAction) {
    const effectiveTimelineActivityType = resolveTimelineActivityTypeOverride(
      candidates,
      allTimelineActivityTypeUniversalIdentifiers,
    );

    if (effectiveTimelineActivityType?.isActive === true) {
      typeByObjectAndAction.set(
        key,
        toResolvedTimelineActivityType(effectiveTimelineActivityType),
      );
    } else if (isDefined(effectiveTimelineActivityType)) {
      suppressedObjectAndActionKeys.add(key);
    } else {
      const { action, objectUniversalIdentifier } = candidates[0];

      if (isDefined(action) && isDefined(objectUniversalIdentifier)) {
        conflicts.push({ action, objectUniversalIdentifier });
        conflictedObjectAndActionKeys.add(key);
      }
    }
  }

  const resolveTimelineActivityType = ({
    action,
    objectUniversalIdentifier,
  }: ResolveTimelineActivityTypeArgs) => {
    const objectAndActionKey = isDefined(objectUniversalIdentifier)
      ? `${objectUniversalIdentifier}|${action}`
      : undefined;

    if (
      isDefined(objectAndActionKey) &&
      (conflictedObjectAndActionKeys.has(objectAndActionKey) ||
        suppressedObjectAndActionKeys.has(objectAndActionKey))
    ) {
      return undefined;
    }

    return (
      (isDefined(objectAndActionKey)
        ? typeByObjectAndAction.get(objectAndActionKey)
        : undefined) ?? typeByAction.get(action)
    );
  };

  return {
    resolveTimelineActivityType,
    conflicts,
    invalidContracts: invalidTimelineActivityTypes.flatMap(
      ({ action, objectUniversalIdentifier }) =>
        isDefined(action) ? [{ action, objectUniversalIdentifier }] : [],
    ),
  };
};
