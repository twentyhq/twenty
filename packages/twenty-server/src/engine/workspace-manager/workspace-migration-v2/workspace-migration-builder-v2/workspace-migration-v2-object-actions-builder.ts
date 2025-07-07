import omit from 'lodash.omit';
import diff from 'microdiff';
import { assertUnreachable } from 'twenty-shared/utils';

import {
  FromTo,
  WorkspaceMigrationActionV2,
} from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-action-common-v2';
import { UpdateObjectAction } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-object-action-v2';
import {
  ObjectMetadataEntityEditableProperties,
  WorkspaceMigrationObjectInput,
  objectMetadataEntityEditableProperties,
} from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-object-input';
import { CustomDeletedCreatedUpdatedMatrix } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/utils/deleted-created-updated-matrix-dispatcher.util';
import {
  getWorkspaceMigrationV2ObjectCreateAction,
  getWorkspaceMigrationV2ObjectDeleteAction,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/utils/get-workspace-migration-v2-object-actions';
import { transformMetadataForComparison } from 'src/engine/workspace-manager/workspace-sync-metadata/comparators/utils/transform-metadata-for-comparison.util';

type ObjectWorkspaceMigrationUpdate = FromTo<WorkspaceMigrationObjectInput>;

const compareTwoWorkspaceMigrationObjectInput = ({
  from,
  to,
}: ObjectWorkspaceMigrationUpdate) => {
  const fromCompare = transformMetadataForComparison(from, {});
  const toCompare = transformMetadataForComparison(to, {});
  const objectMetadataDifference = diff(fromCompare, omit(toCompare, 'fields'));

  return objectMetadataDifference.flatMap<
    UpdateObjectAction['updates'][number]
  >((difference) => {
    switch (difference.type) {
      case 'CHANGE': {
        if (
          difference.oldValue === null &&
          (difference.value === null || difference.value === undefined)
        ) {
          return [];
        }
        const property = difference.path[0];

        // TODO investigate why it would be a number, in case of array I guess ?
        if (typeof property === 'number') {
          return [];
        }

        // Could be handled directly from the diff we do above
        if (
          !objectMetadataEntityEditableProperties.includes(
            property as ObjectMetadataEntityEditableProperties,
          )
        ) {
          return [];
        }

        return {
          property,
          from: difference.oldValue,
          to: difference.value,
        };
      }
      case 'CREATE':
      case 'REMOVE': {
        // Should never occurs ? should throw ?
        return [];
      }
      default: {
        assertUnreachable(difference, 'TODO');
      }
    }
  });
};

export type CreatedDeletedUpdatedObjectMetadataInputMatrix =
  CustomDeletedCreatedUpdatedMatrix<
    'objectMetadata',
    WorkspaceMigrationObjectInput
  >;
export const buildWorkspaceMigrationV2ObjectActions = ({
  createdObjectMetadata,
  deletedObjectMetadata,
  updatedObjectMetadata,
}: CreatedDeletedUpdatedObjectMetadataInputMatrix): WorkspaceMigrationActionV2[] => {
  const createdObjectActions = createdObjectMetadata.map(
    getWorkspaceMigrationV2ObjectCreateAction,
  );

  const deletedObjectActions = deletedObjectMetadata.map(
    getWorkspaceMigrationV2ObjectDeleteAction,
  );

  const updatedObjectActions = updatedObjectMetadata
    .map<UpdateObjectAction | null>(({ from, to }) => {
      const objectUpdatedProperties = compareTwoWorkspaceMigrationObjectInput({
        from,
        to,
      });

      if (objectUpdatedProperties.length === 0) {
        return null;
      }

      return {
        objectMetadataUniqueIdentifier: from.uniqueIdentifier,
        type: 'update_object',
        updates: objectUpdatedProperties,
      };
    })
    .filter((action): action is UpdateObjectAction => action !== null);

  return [
    ...createdObjectActions,
    ...deletedObjectActions,
    ...updatedObjectActions,
  ];
};
