import { isDefined } from 'twenty-shared/utils';

import { type DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { type TimelineActivityRuleAction } from 'src/modules/timeline/types/timeline-activity-rule-action.type';
import { type TimelineActivityRuleTargetShape } from 'src/modules/timeline/types/timeline-activity-rule-target-shape.type';

const SOURCE_EVENT_ACTIONS: Partial<
  Record<DatabaseEventAction, TimelineActivityRuleAction>
> = {
  created: 'created',
  updated: 'updated',
  deleted: 'deleted',
  restored: 'restored',
};

export const resolveTimelineActivityRuleAction = ({
  actions,
  targetShape,
  eventAction,
  eventSource,
}: {
  actions: TimelineActivityRuleAction[];
  targetShape: TimelineActivityRuleTargetShape;
  eventAction: DatabaseEventAction;
  eventSource: 'SOURCE' | 'JUNCTION';
}): TimelineActivityRuleAction | undefined => {
  const sourceEventAction = SOURCE_EVENT_ACTIONS[eventAction];

  if (
    eventSource === 'SOURCE' &&
    isDefined(sourceEventAction) &&
    actions.includes(sourceEventAction)
  ) {
    return sourceEventAction;
  }

  if (
    (eventSource === 'SOURCE' && targetShape.kind !== 'DIRECT_RELATION') ||
    (eventSource === 'JUNCTION' && targetShape.kind !== 'JUNCTION')
  ) {
    return undefined;
  }

  if (
    (eventAction === 'created' || eventAction === 'restored') &&
    actions.includes('linked')
  ) {
    return 'linked';
  }

  if (eventAction === 'deleted' && actions.includes('unlinked')) {
    return 'unlinked';
  }

  if (eventAction === 'updated') {
    return actions.find(
      (action) => action === 'linked' || action === 'unlinked',
    );
  }

  return undefined;
};
