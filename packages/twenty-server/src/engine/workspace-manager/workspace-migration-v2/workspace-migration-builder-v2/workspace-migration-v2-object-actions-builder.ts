import { FlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration-v2/types/flat-object-metadata';
import { CustomDeletedCreatedUpdatedMatrix } from 'src/engine/workspace-manager/workspace-migration-v2/utils/deleted-created-updated-matrix-dispatcher.util';
import { compareTwoFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration-v2/utils/flat-object-metadata-comparator.util';
import {
  UpdateObjectAction,
  WorkspaceMigrationObjectActionV2,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-object-action-v2';
import {
  getWorkspaceMigrationV2ObjectCreateAction,
  getWorkspaceMigrationV2ObjectDeleteAction,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/utils/get-workspace-migration-v2-object-actions';

export type CreatedDeletedUpdatedObjectMetadataInputMatrix =
  CustomDeletedCreatedUpdatedMatrix<'objectMetadata', FlatObjectMetadata>;
export const buildWorkspaceMigrationV2ObjectActions = ({
  createdObjectMetadata,
  deletedObjectMetadata,
  updatedObjectMetadata,
}: CreatedDeletedUpdatedObjectMetadataInputMatrix): WorkspaceMigrationObjectActionV2[] => {
  const createdObjectActions = createdObjectMetadata.map(
    getWorkspaceMigrationV2ObjectCreateAction,
  );

  const deletedObjectActions = deletedObjectMetadata.map(
    getWorkspaceMigrationV2ObjectDeleteAction,
  );

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
        flatObjectMetadata: to,
        updates: objectUpdatedProperties,
      };
    });

  return [
    ...createdObjectActions,
    ...deletedObjectActions,
    ...updatedObjectActions,
  ];
};
