import { type JunctionRelationTargetShape } from 'src/engine/metadata-modules/flat-field-metadata/types/junction-relation-target-shape.type';
import { type RelationTargetJoinColumn } from 'src/engine/metadata-modules/flat-field-metadata/types/relation-target-join-column.type';

export type TimelineActivityRuleTargetShape =
  | { kind: 'SELF' }
  | {
      kind: 'DIRECT_RELATION';
      targetJoinColumns: RelationTargetJoinColumn[];
    }
  | JunctionRelationTargetShape;
