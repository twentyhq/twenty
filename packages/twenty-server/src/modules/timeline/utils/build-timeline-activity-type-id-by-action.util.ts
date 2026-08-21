import { type TimelineActivityAction } from 'twenty-shared/timeline';
import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatTimelineActivityType } from 'src/engine/metadata-modules/flat-timeline-activity-type/types/flat-timeline-activity-type.type';

// Application-declared types carry no action and never win the lookup: the
// first standard type claiming an action is the one rules stamp on their rows.
export const buildTimelineActivityTypeIdByAction = (
  flatTimelineActivityTypeMaps: FlatEntityMaps<FlatTimelineActivityType>,
): Partial<Record<TimelineActivityAction, string>> => {
  const timelineActivityTypeIdByAction: Partial<
    Record<TimelineActivityAction, string>
  > = {};

  for (const flatTimelineActivityType of Object.values(
    flatTimelineActivityTypeMaps.byUniversalIdentifier,
  )) {
    if (
      !isDefined(flatTimelineActivityType) ||
      !isDefined(flatTimelineActivityType.action) ||
      isDefined(timelineActivityTypeIdByAction[flatTimelineActivityType.action])
    ) {
      continue;
    }

    timelineActivityTypeIdByAction[flatTimelineActivityType.action] =
      flatTimelineActivityType.id;
  }

  return timelineActivityTypeIdByAction;
};
