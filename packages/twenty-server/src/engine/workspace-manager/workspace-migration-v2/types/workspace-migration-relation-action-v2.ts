import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { FieldMetadataType } from 'twenty-shared/types';

type RelationActionCommon = Pick<
  FieldMetadataEntity<FieldMetadataType.RELATION>,
  | 'relationTargetFieldMetadata'
  | 'relationTargetFieldMetadataId'
  | 'relationTargetObjectMetadata'
  | 'relationTargetObjectMetadataId'
  | 'settings'
>;

export type CreateRelationAction = {
  type: 'create_relation';
} & RelationActionCommon;


export type UpdateRelationAction = {
  type: 'update_relation';
};

export type DeleteRelationAction = {
  type: 'delete_relation';
};

export type WorkspaceMigrationRelationActionV2 =
  | CreateRelationAction
  | UpdateRelationAction
  | DeleteRelationAction;
