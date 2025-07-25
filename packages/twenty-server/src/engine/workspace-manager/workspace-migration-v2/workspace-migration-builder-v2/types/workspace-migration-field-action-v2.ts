import { FromTo } from 'twenty-shared/types';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { FlatFieldMetadataPropertiesToCompare } from 'src/engine/metadata-modules/flat-field-metadata/utils/compare-two-flat-field-metadata.util';
import { FlatObjectMetadataWithoutFields } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

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
