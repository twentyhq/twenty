import { type TimelineActivityAction } from 'twenty-shared/timeline';
import { isDefined } from 'twenty-shared/utils';

import { type FlatTimelineActivityType } from 'src/engine/metadata-modules/flat-timeline-activity-type/types/flat-timeline-activity-type.type';
import { TimelineException } from 'src/modules/timeline/exceptions/timeline.exception';

export type TimelineActivityTypeResolutionMaps = {
  byUniversalIdentifier: Partial<
    Record<
      string,
      Pick<
        FlatTimelineActivityType,
        'id' | 'action' | 'objectUniversalIdentifier'
      >
    >
  >;
};

export type ResolveTimelineActivityTypeIdArgs = {
  action: TimelineActivityAction;
  objectUniversalIdentifier?: string | null;
};

export type TimelineActivityTypeResolver = (
  args: ResolveTimelineActivityTypeIdArgs,
) => string | undefined;

export const resolveTimelineActivityTypeIdOrThrow = ({
  resolveTimelineActivityTypeId,
  workspaceId,
  ...args
}: ResolveTimelineActivityTypeIdArgs & {
  resolveTimelineActivityTypeId: TimelineActivityTypeResolver;
  workspaceId: string;
}): string => {
  const timelineActivityTypeId = resolveTimelineActivityTypeId(args);

  if (!isDefined(timelineActivityTypeId)) {
    const objectContext = isDefined(args.objectUniversalIdentifier)
      ? ` for object ${args.objectUniversalIdentifier}`
      : '';

    throw new TimelineException(
      `No timeline activity type resolves action ${args.action}${objectContext} in workspace ${workspaceId}`,
    );
  }

  return timelineActivityTypeId;
};

// A type bound to the event's object wins, so a linked note is stamped with the
// note type and renders through its own component; the unbound type for the same
// action is the fallback every other object shares.
//
// Ambiguous definitions fail while building the cache: silently choosing one
// would make an application's audit semantics depend on metadata ordering.
export const buildTimelineActivityTypeResolver = (
  flatTimelineActivityTypeMaps: TimelineActivityTypeResolutionMaps,
): TimelineActivityTypeResolver => {
  const idByObjectAndAction = new Map<string, string>();
  const idByAction = new Map<TimelineActivityAction, string>();

  for (const flatTimelineActivityType of Object.values(
    flatTimelineActivityTypeMaps.byUniversalIdentifier,
  )) {
    if (
      !isDefined(flatTimelineActivityType) ||
      !isDefined(flatTimelineActivityType.action)
    ) {
      continue;
    }

    const { action, objectUniversalIdentifier, id } = flatTimelineActivityType;

    if (!isDefined(objectUniversalIdentifier)) {
      if (idByAction.has(action)) {
        throw new TimelineException(
          `Multiple timeline activity types resolve shared action ${action}`,
        );
      }

      idByAction.set(action, id);

      continue;
    }

    const key = `${objectUniversalIdentifier}|${action}`;

    if (idByObjectAndAction.has(key)) {
      throw new TimelineException(
        `Multiple timeline activity types resolve action ${action} for object ${objectUniversalIdentifier}`,
      );
    }

    idByObjectAndAction.set(key, id);
  }

  return ({ action, objectUniversalIdentifier }) =>
    (isDefined(objectUniversalIdentifier)
      ? idByObjectAndAction.get(`${objectUniversalIdentifier}|${action}`)
      : undefined) ?? idByAction.get(action);
};
