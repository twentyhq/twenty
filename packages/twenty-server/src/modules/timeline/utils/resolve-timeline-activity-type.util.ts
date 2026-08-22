import {
  type TimelineActivityAction,
  type TimelineActivityTypeSnapshot,
} from 'twenty-shared/timeline';
import { isDefined } from 'twenty-shared/utils';

import { type FlatTimelineActivityType } from 'src/engine/metadata-modules/flat-timeline-activity-type/types/flat-timeline-activity-type.type';
import { TimelineException } from 'src/modules/timeline/exceptions/timeline.exception';

type ResolvableTimelineActivityType = Pick<
  FlatTimelineActivityType,
  | 'id'
  | 'applicationId'
  | 'universalIdentifier'
  | 'name'
  | 'label'
  | 'action'
  | 'icon'
  | 'objectUniversalIdentifier'
  | 'targetRelationFieldUniversalIdentifier'
  | 'frontComponentUniversalIdentifier'
>;

export type TimelineActivityTypeResolutionMaps = {
  byUniversalIdentifier: Partial<
    Record<string, ResolvableTimelineActivityType>
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

export type TimelineActivityTypeResolver = (
  args: ResolveTimelineActivityTypeArgs,
) => ResolvedTimelineActivityType | undefined;

export const toResolvedTimelineActivityType = (
  timelineActivityType: ResolvableTimelineActivityType,
): ResolvedTimelineActivityType => ({
  id: timelineActivityType.id,
  applicationId: timelineActivityType.applicationId,
  snapshot: {
    id: timelineActivityType.id,
    universalIdentifier: timelineActivityType.universalIdentifier,
    name: timelineActivityType.name,
    label: timelineActivityType.label,
    action: timelineActivityType.action,
    icon: timelineActivityType.icon,
    objectUniversalIdentifier: timelineActivityType.objectUniversalIdentifier,
    frontComponentUniversalIdentifier:
      timelineActivityType.frontComponentUniversalIdentifier,
  },
});

export const resolveTimelineActivityTypeOrThrow = ({
  resolveTimelineActivityType,
  workspaceId,
  ...args
}: ResolveTimelineActivityTypeArgs & {
  resolveTimelineActivityType: TimelineActivityTypeResolver;
  workspaceId: string;
}): ResolvedTimelineActivityType => {
  const timelineActivityType = resolveTimelineActivityType(args);

  if (!isDefined(timelineActivityType)) {
    const objectContext = isDefined(args.objectUniversalIdentifier)
      ? ` for object ${args.objectUniversalIdentifier}`
      : '';

    throw new TimelineException(
      `No timeline activity type resolves action ${args.action}${objectContext} in workspace ${workspaceId}`,
    );
  }

  return timelineActivityType;
};

// Object-bound types override shared types. Ambiguity is rejected because
// metadata ordering must never decide the audit semantics of an event.
export const buildResolvedTimelineActivityTypeResolver = (
  flatTimelineActivityTypeMaps: TimelineActivityTypeResolutionMaps,
): TimelineActivityTypeResolver => {
  const typeByObjectAndAction = new Map<string, ResolvedTimelineActivityType>();
  const typeByAction = new Map<
    TimelineActivityAction,
    ResolvedTimelineActivityType
  >();

  for (const timelineActivityType of Object.values(
    flatTimelineActivityTypeMaps.byUniversalIdentifier,
  )) {
    if (
      !isDefined(timelineActivityType) ||
      !isDefined(timelineActivityType.action) ||
      isDefined(timelineActivityType.targetRelationFieldUniversalIdentifier)
    ) {
      continue;
    }

    const resolvedTimelineActivityType =
      toResolvedTimelineActivityType(timelineActivityType);
    const { action, objectUniversalIdentifier } = timelineActivityType;

    if (!isDefined(objectUniversalIdentifier)) {
      if (typeByAction.has(action)) {
        throw new TimelineException(
          `Multiple timeline activity types resolve shared action ${action}`,
        );
      }

      typeByAction.set(action, resolvedTimelineActivityType);

      continue;
    }

    const key = `${objectUniversalIdentifier}|${action}`;

    if (typeByObjectAndAction.has(key)) {
      throw new TimelineException(
        `Multiple timeline activity types resolve action ${action} for object ${objectUniversalIdentifier}`,
      );
    }

    typeByObjectAndAction.set(key, resolvedTimelineActivityType);
  }

  return ({ action, objectUniversalIdentifier }) =>
    (isDefined(objectUniversalIdentifier)
      ? typeByObjectAndAction.get(`${objectUniversalIdentifier}|${action}`)
      : undefined) ?? typeByAction.get(action);
};
