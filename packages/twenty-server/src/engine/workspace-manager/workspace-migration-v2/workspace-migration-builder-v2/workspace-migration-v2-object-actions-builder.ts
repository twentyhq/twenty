import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { compareTwoFlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/utils/compare-two-flat-object-metadata.util';
import { CustomDeletedCreatedUpdatedMatrix } from 'src/engine/workspace-manager/workspace-migration-v2/utils/deleted-created-updated-matrix-dispatcher.util';
import {
  UpdateObjectAction,
  WorkspaceMigrationObjectActionV2,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-object-action-v2';
import { getWorkspaceMigrationV2FieldCreateAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/utils/get-workspace-migration-v2-field-actions';
import {
  getWorkspaceMigrationV2ObjectCreateAction,
  getWorkspaceMigrationV2ObjectDeleteAction,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/utils/get-workspace-migration-v2-object-actions';

export type CreatedDeletedUpdatedObjectMetadataInputMatrix =
  CustomDeletedCreatedUpdatedMatrix<'objectMetadata', FlatObjectMetadata> & {
    inferDeletionFromMissingObjectFieldIndex: boolean;
  };
export const buildWorkspaceMigrationV2ObjectActions = ({
  createdObjectMetadata,
  deletedObjectMetadata,
  updatedObjectMetadata,
  inferDeletionFromMissingObjectFieldIndex,
}: CreatedDeletedUpdatedObjectMetadataInputMatrix): WorkspaceMigrationObjectActionV2[] => {
  const createdObjectActions = createdObjectMetadata.map(
    (flatObjectMetadata) => {
      const createFieldActions = flatObjectMetadata.flatFieldMetadatas.map(
        (flatFieldMetadata) =>
          getWorkspaceMigrationV2FieldCreateAction({
            flatFieldMetadata,
            flatObjectMetadata,
          }),
      );

      return getWorkspaceMigrationV2ObjectCreateAction({
        flatObjectMetadata,
        createFieldActions,
      });
    },
  );

  const deletedObjectActions = inferDeletionFromMissingObjectFieldIndex
    ? deletedObjectMetadata.map(getWorkspaceMigrationV2ObjectDeleteAction)
    : [];

  const updatedObjectActions =
    updatedObjectMetadata.flatMap<UpdateObjectAction>(({ from, to }) => {
      const objectUpdatedProperties = compareTwoFlatObjectMetadata({
        from,
        to,
      });

      if (objectUpdatedProperties.length === 0) {
        return [];
      }

      return {
        type: 'update_object',
        objectMetadataId: to.id,
        updates: objectUpdatedProperties,
      };
    });

  return [
    ...createdObjectActions,
    ...deletedObjectActions,
    ...updatedObjectActions,
  ];
};
