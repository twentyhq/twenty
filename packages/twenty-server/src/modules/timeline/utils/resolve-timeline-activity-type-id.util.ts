import { type TimelineActivityAction } from 'twenty-shared/timeline';
import { isDefined } from 'twenty-shared/utils';

import { type FlatTimelineActivityType } from 'src/engine/metadata-modules/flat-timeline-activity-type/types/flat-timeline-activity-type.type';

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

export type TimelineActivityTypeResolver = (args: {
  action: TimelineActivityAction;
  objectUniversalIdentifier?: string | null;
}) => string | undefined;

// A type bound to the event's object wins, so a linked note is stamped with the
// note type and renders through its own component; the unbound type for the same
// action is the fallback every other object shares.
//
// Candidates are ordered by universal identifier before the first one wins, so a
// workspace whose types collide on a dispatch key still resolves the same way on
// every run rather than following map iteration order.
export const buildTimelineActivityTypeResolver = (
  flatTimelineActivityTypeMaps: TimelineActivityTypeResolutionMaps,
): TimelineActivityTypeResolver => {
  const idByObjectAndAction = new Map<string, string>();
  const idByAction = new Map<TimelineActivityAction, string>();

  const orderedFlatTimelineActivityTypes = Object.entries(
    flatTimelineActivityTypeMaps.byUniversalIdentifier,
  )
    .sort(([leftUniversalIdentifier], [rightUniversalIdentifier]) =>
      leftUniversalIdentifier.localeCompare(rightUniversalIdentifier),
    )
    .map(([, flatTimelineActivityType]) => flatTimelineActivityType);

  for (const flatTimelineActivityType of orderedFlatTimelineActivityTypes) {
    if (
      !isDefined(flatTimelineActivityType) ||
      !isDefined(flatTimelineActivityType.action)
    ) {
      continue;
    }

    const { action, objectUniversalIdentifier, id } = flatTimelineActivityType;

    if (!isDefined(objectUniversalIdentifier)) {
      if (!idByAction.has(action)) {
        idByAction.set(action, id);
      }

      continue;
    }

    const key = `${objectUniversalIdentifier}|${action}`;

    if (!idByObjectAndAction.has(key)) {
      idByObjectAndAction.set(key, id);
    }
  }

  return ({ action, objectUniversalIdentifier }) =>
    (isDefined(objectUniversalIdentifier)
      ? idByObjectAndAction.get(`${objectUniversalIdentifier}|${action}`)
      : undefined) ?? idByAction.get(action);
};
