import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  FieldMetadataUniqueIdentifier,
  ObjectMetadataUniqueIdentifier,
} from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-action-common-v2';

type FieldActionCommon = {
  field: Partial<FieldMetadataEntity>;
} & ObjectMetadataUniqueIdentifier &
  FieldMetadataUniqueIdentifier;
export type CreateFieldAction = {
  type: 'create_field';
} & FieldActionCommon;

export type UpdateFieldAction = {
  type: 'update_field';
} & FieldActionCommon;

export type DeleteFieldAction = {
  type: 'delete_field';
} & Omit<FieldActionCommon, 'field'>;

export type WorkspaceMigrationFieldActionV2 =
  | CreateFieldAction
  | UpdateFieldAction
  | DeleteFieldAction;
