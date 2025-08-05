import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import {
  CreateFieldAction,
  DeleteFieldAction,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-field-action-v2';

type FlatFieldMetadataAndFlatObjectMetadata = {
  flatFieldMetadata: FlatFieldMetadata;
  flatObjectMetadata: FlatObjectMetadata;
};

export const getWorkspaceMigrationV2FieldCreateAction = ({
  flatFieldMetadata,
}: FlatFieldMetadataAndFlatObjectMetadata): CreateFieldAction => ({
  type: 'create_field',
  flatFieldMetadata,
});

export const getWorkspaceMigrationV2FieldDeleteAction = ({
  flatFieldMetadata,
  flatObjectMetadata,
}: FlatFieldMetadataAndFlatObjectMetadata): DeleteFieldAction => ({
  type: 'delete_field',
  fieldMetadataId: flatFieldMetadata.id,
  objectMetadataId: flatObjectMetadata.id,
});
