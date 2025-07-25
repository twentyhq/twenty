import { FlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration-v2/types/flat-field-metadata';
import { FlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration-v2/types/flat-object-metadata';
import {
  CreateFieldAction,
  DeleteFieldAction,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-field-action-v2';
import { fromFlatObjectMetadataToFlatObjectMetadataWithoutFields } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/utils/from-flat-object-metadata-to-flat-object-metadata-without-fields.util';

type FlatFieldMetadataAndFlatObjectMetadata = {
  flatFieldMetadata: FlatFieldMetadata;
  flatObjectMetadata: FlatObjectMetadata;
};

export const getWorkspaceMigrationV2FieldCreateAction = ({
  flatFieldMetadata,
  flatObjectMetadata,
}: FlatFieldMetadataAndFlatObjectMetadata): CreateFieldAction => ({
  type: 'create_field',
  flatFieldMetadata,
  flatObjectMetadataWithoutFields:
    fromFlatObjectMetadataToFlatObjectMetadataWithoutFields(flatObjectMetadata),
});

export const getWorkspaceMigrationV2FieldDeleteAction = ({
  flatFieldMetadata,
  flatObjectMetadata,
}: FlatFieldMetadataAndFlatObjectMetadata): DeleteFieldAction => ({
  type: 'delete_field',
  flatFieldMetadata,
  flatObjectMetadataWithoutFields:
    fromFlatObjectMetadataToFlatObjectMetadataWithoutFields(flatObjectMetadata),
});
