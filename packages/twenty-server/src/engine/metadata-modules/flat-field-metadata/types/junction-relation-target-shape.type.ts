import { type RelationTargetJoinColumn } from 'src/engine/metadata-modules/flat-field-metadata/types/relation-target-join-column.type';

export type JunctionRelationTargetShape = {
  kind: 'JUNCTION';
  junctionObjectMetadataId: string;
  junctionObjectNameSingular: string;
  junctionSourceJoinColumnName: string;
  targetJoinColumns: RelationTargetJoinColumn[];
};
