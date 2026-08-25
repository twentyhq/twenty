import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type TimelineActivityRuleAction } from 'src/modules/timeline/types/timeline-activity-rule-action.type';
import { type TimelineActivityRuleTargetShape } from 'src/modules/timeline/types/timeline-activity-rule-target-shape.type';
import { type ResolvedTimelineActivityType } from 'src/modules/timeline/utils/resolve-timeline-activity-type.util';

export type TimelineActivityRule = {
  sourceFlatObjectMetadata: FlatObjectMetadata;
  actions: TimelineActivityRuleAction[];
  timelineActivityType?: ResolvedTimelineActivityType;
  triggerFieldNames: string[] | null;
  targetShape: TimelineActivityRuleTargetShape;
};
