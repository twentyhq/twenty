import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { FieldAndObjectMetadataWorkspaceMigrationInput } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-field-action-v2';
import {
  CreateRelationAction,
  DeleteRelationAction,
} from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-relation-action-v2';

export const getWorkspaceMigrationV2RelationCreateAction = ({
  fieldMetadataInput,
  objectMetadataInput,
}: FieldAndObjectMetadataWorkspaceMigrationInput): CreateRelationAction => ({
  type: 'create_relation',
  // TODO
  relationTargetFieldMetadata: {} as FieldMetadataEntity,
  relationTargetFieldMetadataId: '',
  relationTargetObjectMetadata: {} as ObjectMetadataEntity,
  relationTargetObjectMetadataId: '',
  settings: undefined,
  ///
});

export const getWorkspaceMigrationV2RelationDeleteAction = ({
  fieldMetadataInput,
  objectMetadataInput,
}: FieldAndObjectMetadataWorkspaceMigrationInput): DeleteRelationAction => ({
  type: 'delete_relation',
});
