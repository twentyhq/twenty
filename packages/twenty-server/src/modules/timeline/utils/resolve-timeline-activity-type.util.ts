import {
  type TimelineActivityAction,
  type TimelineActivityTypeSnapshot,
} from 'twenty-shared/timeline';
import { isDefined } from 'twenty-shared/utils';

import { type FlatTimelineActivityType } from 'src/engine/metadata-modules/flat-timeline-activity-type/types/flat-timeline-activity-type.type';
import { resolveOverridableEntityProperty } from 'src/engine/metadata-modules/utils/resolve-overridable-entity-property.util';
import { partitionTimelineActivityTypesByValidity } from 'src/engine/metadata-modules/timeline-activity-type/utils/is-valid-timeline-activity-type-override.util';
import { resolveTimelineActivityTypeOverride } from 'src/engine/metadata-modules/timeline-activity-type/utils/resolve-timeline-activity-type-override.util';
import { resolveTimelineActivityTypeRouting } from 'src/modules/timeline/utils/resolve-timeline-activity-type-routing.util';

export type ResolvableTimelineActivityType = Pick<
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
  | 'replacesTimelineActivityTypeUniversalIdentifier'
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
  effectiveTimelineActivityTypes: ResolvableTimelineActivityType[];
  routingConflicts: TimelineActivityTypeResolutionConflict[];
  resolverConflicts: TimelineActivityTypeResolutionConflict[];
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

export const buildTimelineActivityTypeResolution = (
  flatTimelineActivityTypeMaps: TimelineActivityTypeResolutionMaps,
): TimelineActivityTypeResolution => {
  const allUnvalidatedTimelineActivityTypes = Object.values(
    flatTimelineActivityTypeMaps.byUniversalIdentifier,
  ).filter(isDefined);
  const timelineActivityTypeByUniversalIdentifier = Object.fromEntries(
    allUnvalidatedTimelineActivityTypes.map((timelineActivityType) => [
      timelineActivityType.universalIdentifier,
      timelineActivityType,
    ]),
  );
  const { validTimelineActivityTypes, invalidTimelineActivityTypes } =
    partitionTimelineActivityTypesByValidity({
      timelineActivityTypes: allUnvalidatedTimelineActivityTypes,
      objectMetadataByUniversalIdentifier:
        flatTimelineActivityTypeMaps.objectMetadataByUniversalIdentifier,
      timelineActivityTypeByUniversalIdentifier,
    });
  const allTimelineActivityTypes = validTimelineActivityTypes.map(
    (timelineActivityType) => {
      const routing = resolveTimelineActivityTypeRouting(timelineActivityType);

      return isDefined(routing)
        ? { ...timelineActivityType, ...routing }
        : timelineActivityType;
    },
  );
  const allTimelineActivityTypeUniversalIdentifiers = new Set(
    allTimelineActivityTypes.map(
      (timelineActivityType) => timelineActivityType.universalIdentifier,
    ),
  );
  const candidatesByEmitKey = new Map<
    string,
    ResolvableTimelineActivityType[]
  >();

  for (const timelineActivityType of allTimelineActivityTypes) {
    if (!isDefined(timelineActivityType.action)) {
      continue;
    }

    const emitKey = [
      timelineActivityType.action,
      timelineActivityType.objectUniversalIdentifier ?? 'ANY_OBJECT',
      timelineActivityType.targetRelationFieldUniversalIdentifier ?? 'SELF',
    ].join('|');

    const candidates = candidatesByEmitKey.get(emitKey);

    if (isDefined(candidates)) {
      candidates.push(timelineActivityType);
    } else {
      candidatesByEmitKey.set(emitKey, [timelineActivityType]);
    }
  }

  const effectiveTimelineActivityTypes: ResolvableTimelineActivityType[] = [];
  const routingConflicts: TimelineActivityTypeResolutionConflict[] = [];
  const resolverConflicts: TimelineActivityTypeResolutionConflict[] = [];
  const conflictedObjectAndActionKeys = new Set<string>();

  for (const candidates of candidatesByEmitKey.values()) {
    const effectiveTimelineActivityType = resolveTimelineActivityTypeOverride(
      candidates,
      allTimelineActivityTypeUniversalIdentifiers,
    );

    if (isDefined(effectiveTimelineActivityType)) {
      effectiveTimelineActivityTypes.push(effectiveTimelineActivityType);
      continue;
    }

    const [candidate] = candidates;

    if (!isDefined(candidate.action)) {
      continue;
    }

    const conflict = {
      action: candidate.action,
      objectUniversalIdentifier: candidate.objectUniversalIdentifier,
    };

    if (isDefined(candidate.targetRelationFieldUniversalIdentifier)) {
      routingConflicts.push(conflict);
      continue;
    }

    resolverConflicts.push(conflict);

    if (isDefined(conflict.objectUniversalIdentifier)) {
      conflictedObjectAndActionKeys.add(
        `${conflict.objectUniversalIdentifier}|${conflict.action}`,
      );
    }
  }

  const typeByAction = new Map<
    TimelineActivityAction,
    ResolvedTimelineActivityType
  >();
  const typeByObjectAndAction = new Map<string, ResolvedTimelineActivityType>();
  const suppressedObjectAndActionKeys = new Set<string>();

  for (const timelineActivityType of effectiveTimelineActivityTypes) {
    const { action, objectUniversalIdentifier } = timelineActivityType;

    if (
      !isDefined(action) ||
      isDefined(timelineActivityType.targetRelationFieldUniversalIdentifier)
    ) {
      continue;
    }

    if (!isDefined(objectUniversalIdentifier)) {
      if (timelineActivityType.isActive) {
        typeByAction.set(
          action,
          toResolvedTimelineActivityType(timelineActivityType),
        );
      }

      continue;
    }

    const key = `${objectUniversalIdentifier}|${action}`;

    if (timelineActivityType.isActive) {
      typeByObjectAndAction.set(
        key,
        toResolvedTimelineActivityType(timelineActivityType),
      );
    } else {
      suppressedObjectAndActionKeys.add(key);
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
    effectiveTimelineActivityTypes,
    routingConflicts,
    resolverConflicts,
    invalidContracts: invalidTimelineActivityTypes.flatMap(
      ({ action, objectUniversalIdentifier }) =>
        isDefined(action) ? [{ action, objectUniversalIdentifier }] : [],
    ),
  };
};
