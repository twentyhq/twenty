import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type TimelineActivityRuleAction } from 'src/modules/timeline/types/timeline-activity-rule-action.type';
import { type TimelineActivityRuleTargetShape } from 'src/modules/timeline/types/timeline-activity-rule-target-shape.type';

export type TimelineActivityRule = {
  // Object whose events trigger this rule. Carried whole so the label of a
  // linked record resolves through the shared display-name logic
  sourceFlatObjectMetadata: FlatObjectMetadata;
  actions: TimelineActivityRuleAction[];
  // Diff keys gating the `updated` action. null = any field
  triggerFieldNames: string[] | null;
  targetShape: TimelineActivityRuleTargetShape;
};
