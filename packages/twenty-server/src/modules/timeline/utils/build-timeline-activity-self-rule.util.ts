import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatTimelineActivityType } from 'src/engine/metadata-modules/flat-timeline-activity-type/types/flat-timeline-activity-type.type';
import { type TimelineActivityRuleAction } from 'src/modules/timeline/types/timeline-activity-rule-action.type';
import { type TimelineActivityRule } from 'src/modules/timeline/types/timeline-activity-rule.type';

const DEFAULT_SELF_RULE_ACTIONS = [
  'created',
  'updated',
  'deleted',
  'restored',
] as const;

export const buildTimelineActivitySelfRule = ({
  flatObjectMetadata,
  timelineActivityTypes,
}: {
  flatObjectMetadata: FlatObjectMetadata;
  timelineActivityTypes: Pick<
    FlatTimelineActivityType,
    | 'action'
    | 'objectUniversalIdentifier'
    | 'targetRelationFieldUniversalIdentifier'
  >[];
}): TimelineActivityRule | undefined => {
  const declaredActions = timelineActivityTypes
    .filter(
      (timelineActivityType) =>
        timelineActivityType.objectUniversalIdentifier ===
          flatObjectMetadata.universalIdentifier &&
        !isDefined(timelineActivityType.targetRelationFieldUniversalIdentifier),
    )
    .map(({ action }) => action)
    .filter(isDefined);
  const defaultActions =
    flatObjectMetadata.isAuditLogged && !flatObjectMetadata.isSystem
      ? DEFAULT_SELF_RULE_ACTIONS
      : [];
  const actions: TimelineActivityRuleAction[] = [
    ...new Set([...defaultActions, ...declaredActions]),
  ];

  if (!isNonEmptyArray(actions)) {
    return undefined;
  }

  return {
    sourceFlatObjectMetadata: flatObjectMetadata,
    actions,
    triggerFieldNames: null,
    targetShape: { kind: 'SELF' },
  };
};
