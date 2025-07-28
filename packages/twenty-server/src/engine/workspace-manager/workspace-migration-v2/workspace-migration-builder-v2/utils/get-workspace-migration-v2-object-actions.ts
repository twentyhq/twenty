import { FlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration-v2/types/flat-object-metadata';
import { CreateFieldAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-field-action-v2';
import {
  CreateObjectAction,
  DeleteObjectAction,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-object-action-v2';
import { fromFlatObjectMetadataToFlatObjectMetadataWithoutFields } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/utils/from-flat-object-metadata-to-flat-object-metadata-without-fields.util';

export const getWorkspaceMigrationV2ObjectCreateAction = ({
  createFieldActions,
  flatObjectMetadata,
}: {
  flatObjectMetadata: FlatObjectMetadata;
  createFieldActions: CreateFieldAction[];
}): CreateObjectAction => ({
  type: 'create_object',
  flatObjectMetadataWithoutFields:
    fromFlatObjectMetadataToFlatObjectMetadataWithoutFields(flatObjectMetadata),
  createFieldActions,
});

export const getWorkspaceMigrationV2ObjectDeleteAction = (
  flatObjectMetadata: FlatObjectMetadata,
): DeleteObjectAction => ({
  type: 'delete_object',
  flatObjectMetadataWithoutFields:
    fromFlatObjectMetadataToFlatObjectMetadataWithoutFields(flatObjectMetadata),
});
