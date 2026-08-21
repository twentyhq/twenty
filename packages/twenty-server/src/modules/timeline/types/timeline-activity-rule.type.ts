import { type TimelineActivityAction } from 'twenty-shared/timeline';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export type TimelineActivityRuleAction = TimelineActivityAction;

export type TimelineActivityRuleTargetJoinColumn = {
  joinColumnName: string;
  targetObjectNameSingular: string;
};

export type TimelineActivityRuleTargetShape =
  | { kind: 'SELF' }
  | {
      kind: 'JUNCTION';
      junctionObjectMetadataId: string;
      junctionObjectNameSingular: string;
      // Column on the junction object pointing back at the rule object, e.g. noteId
      junctionSourceJoinColumnName: string;
      // Columns on the junction object pointing at the records receiving the
      // entry. More than one when the junction target is a morph relation
      junctionTargetJoinColumns: TimelineActivityRuleTargetJoinColumn[];
    };

export type TimelineActivityRule = {
  // Object whose events trigger this rule. Carried whole so the label of a
  // linked record resolves through the shared display-name logic
  sourceFlatObjectMetadata: FlatObjectMetadata;
  // Relation this rule walks, null for the rule on the record itself. Written
  // onto every entry so a row names the rule that produced it.
  relationFieldMetadataId: string | null;
  actions: TimelineActivityRuleAction[];
  // Diff keys gating the `updated` action. null = any field
  triggerFieldNames: string[] | null;
  targetShape: TimelineActivityRuleTargetShape;
};
