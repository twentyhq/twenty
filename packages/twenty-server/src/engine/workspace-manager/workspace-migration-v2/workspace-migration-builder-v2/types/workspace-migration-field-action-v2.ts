import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { FlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration-v2/types/flat-field-metadata';
import { FlatObjectMetadataWithoutFields } from 'src/engine/workspace-manager/workspace-migration-v2/types/flat-object-metadata';
import { FromTo } from 'src/engine/workspace-manager/workspace-migration-v2/types/from-to.type';
import { FlatFieldMetadataPropertiesToCompare } from 'src/engine/workspace-manager/workspace-migration-v2/utils/flat-field-metadata-comparator.util';

export type CreateFieldAction = {
  type: 'create_field';
  flatFieldMetadata: FlatFieldMetadata;
  flatObjectMetadataWithoutFields: FlatObjectMetadataWithoutFields;
};

export type UpdateFieldAction = {
  type: 'update_field';
  workspaceId: string;
  flatFieldMetadata: FlatFieldMetadata;
  flatObjectMetadataWithoutFields: FlatObjectMetadataWithoutFields;
  updates: Array<
    {
      [P in FlatFieldMetadataPropertiesToCompare]: {
        property: P;
      } & FromTo<FieldMetadataEntity[P]>;
    }[FlatFieldMetadataPropertiesToCompare]
  >;
};

export type DeleteFieldAction = {
  type: 'delete_field';
  flatFieldMetadata: FlatFieldMetadata;
  flatObjectMetadataWithoutFields: FlatObjectMetadataWithoutFields;
};

export type WorkspaceMigrationFieldActionV2 =
  | CreateFieldAction
  | UpdateFieldAction
  | DeleteFieldAction;

export type WorkspaceMigrationFieldActionTypeV2 =
  WorkspaceMigrationFieldActionV2['type'];
