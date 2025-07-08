import {
  UpdateObjectAction,
  WorkspaceMigrationV2ObjectAction,
} from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-object-action-v2';
import { WorkspaceMigrationObjectInput } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-object-input';
import { CustomDeletedCreatedUpdatedMatrix } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/utils/deleted-created-updated-matrix-dispatcher.util';
import {
  getWorkspaceMigrationV2ObjectCreateAction,
  getWorkspaceMigrationV2ObjectDeleteAction,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/utils/get-workspace-migration-v2-object-actions';
import { compareTwoWorkspaceMigrationObjectInput } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/utils/workspace-migration-object-metadata-input-comparator.util';

export type CreatedDeletedUpdatedObjectMetadataInputMatrix =
  CustomDeletedCreatedUpdatedMatrix<
    'objectMetadata',
    WorkspaceMigrationObjectInput
  >;
export const buildWorkspaceMigrationV2ObjectActions = ({
  createdObjectMetadata,
  deletedObjectMetadata,
  updatedObjectMetadata,
}: CreatedDeletedUpdatedObjectMetadataInputMatrix): WorkspaceMigrationV2ObjectAction[] => {
  const createdObjectActions = createdObjectMetadata.map(
    getWorkspaceMigrationV2ObjectCreateAction,
  );

  const deletedObjectActions = deletedObjectMetadata.map(
    getWorkspaceMigrationV2ObjectDeleteAction,
  );

  const updatedObjectActions =
    updatedObjectMetadata.flatMap<UpdateObjectAction>(({ from, to }) => {
      const objectUpdatedProperties = compareTwoWorkspaceMigrationObjectInput({
        from,
        to,
      });

      if (objectUpdatedProperties.length === 0) {
        return [];
      }

      return {
        type: 'update_object',
        objectMetadataInput: to,
        updates: objectUpdatedProperties,
      };
    });

  return [
    ...createdObjectActions,
    ...deletedObjectActions,
    ...updatedObjectActions,
  ];
};
