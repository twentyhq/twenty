import { type TimelineActivityRuleAction } from 'src/modules/timeline/types/timeline-activity-rule-action.type';
import { type TimelineActivityRule } from 'src/modules/timeline/types/timeline-activity-rule.type';
import {
  type ResolvedTimelineActivityType,
  type TimelineActivityTypeResolver,
} from 'src/modules/timeline/utils/resolve-timeline-activity-type.util';

export const resolveTimelineActivityTypeForRule = ({
  rule,
  ruleAction,
  resolveTimelineActivityType,
}: {
  rule: TimelineActivityRule;
  ruleAction: TimelineActivityRuleAction;
  resolveTimelineActivityType: TimelineActivityTypeResolver;
}): ResolvedTimelineActivityType | undefined =>
  rule.timelineActivityType ??
  resolveTimelineActivityType({
    action: ruleAction,
    objectUniversalIdentifier:
      rule.sourceFlatObjectMetadata.universalIdentifier,
  });
