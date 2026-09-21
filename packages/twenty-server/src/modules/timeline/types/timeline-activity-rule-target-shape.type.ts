import { type TimelineActivityRuleTargetJoinColumn } from 'src/modules/timeline/types/timeline-activity-rule-target-join-column.type';

export type TimelineActivityRuleTargetShape =
  | { kind: 'SELF' }
  | {
      kind: 'DIRECT_RELATION';
      targetJoinColumns: TimelineActivityRuleTargetJoinColumn[];
    }
  | {
      kind: 'JUNCTION';
      junctionObjectMetadataId: string;
      junctionObjectNameSingular: string;
      junctionSourceJoinColumnName: string;
      targetJoinColumns: TimelineActivityRuleTargetJoinColumn[];
    };
