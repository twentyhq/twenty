import { type TimelineActivityRuleTargetJoinColumn } from 'src/modules/timeline/types/timeline-activity-rule-target-join-column.type';

export type TimelineActivityRuleTargetShape =
  | { kind: 'SELF' }
  | {
      kind: 'MANY_TO_ONE';
      // Field on the rule object whose diff carries the relation change
      relationFieldName: string;
      // Column on the rule object pointing at the record receiving the entry
      targetJoinColumn: TimelineActivityRuleTargetJoinColumn;
    }
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
