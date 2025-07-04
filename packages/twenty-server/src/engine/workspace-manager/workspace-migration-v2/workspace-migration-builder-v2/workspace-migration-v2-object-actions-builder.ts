import omit from 'lodash.omit';
import diff from 'microdiff';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import {
  FromTo,
  UpdateObjectAction,
  WorkspaceMigrationV2ObjectAction,
} from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-action-v2';
import { WorkspaceMigrationObjectInput } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-object-input';
import { UniqueIdentifierWorkspaceMigrationObjectInputMapDispatcher } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/workspace-migration-builder-v2.service';
import { transformMetadataForComparison } from 'src/engine/workspace-manager/workspace-sync-metadata/comparators/utils/transform-metadata-for-comparison.util';
import { assertUnreachable } from 'twenty-shared/utils';

const objectPropertiesToIgnore = [
  'id',
  'createdAt',
  'updatedAt',
  'labelIdentifierFieldMetadataId',
  'imageIdentifierFieldMetadataId',
  'isActive',
  'fields',
];

// Not the same for standard and custom
const allowedObjectProps: (keyof Partial<ObjectMetadataEntity>)[] = [
  'nameSingular',
  'namePlural',
  'labelSingular',
  'labelPlural',
  'description',
];

type ObjectWorkspaceMigrationUpdate = FromTo<WorkspaceMigrationObjectInput>;

const compareTwoWorkspaceMigrationObjectInput = ({
  from,
  to,
}: ObjectWorkspaceMigrationUpdate) => {
  const fromCompare = transformMetadataForComparison(from, {
    shouldIgnoreProperty: (property) =>
      objectPropertiesToIgnore.includes(property),
  });
  const toCompare = transformMetadataForComparison(to, {
    shouldIgnoreProperty: (property) =>
      objectPropertiesToIgnore.includes(property),
  });
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
          !allowedObjectProps.includes(property as keyof ObjectMetadataEntity)
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
        // Should never occurs ?
        return [];
      }
      default: {
        assertUnreachable(difference, 'TODO');
      }
    }
  });
};

// Should return WorkspaceObjectMigrationV2 ?
export const buildWorkspaceMigrationV2ObjectActions = ({
  created,
  deleted,
  updated,
}: UniqueIdentifierWorkspaceMigrationObjectInputMapDispatcher): WorkspaceMigrationV2ObjectAction[] => {
  const objectWorkspaceActions: WorkspaceMigrationV2ObjectAction[] = [];

  created.forEach((objectMetadata, uniqueIdentifier) => {
    objectWorkspaceActions.push({
      uniqueIdentifier,
      type: 'create_object',
      object: objectMetadata, // TODO // Question should this contain field create migrations too or ?
    });
  });

  deleted.forEach((objectMetadata, uniqueIdentifier) => {
    objectWorkspaceActions.push({
      type: 'delete_object',
      uniqueIdentifier,
      objectMetadataId: objectMetadata.uniqueIdentifier,
    });
  });

  updated.forEach(({ from, to }, uniqueIdentifier) => {
    const objectUpdatedProperties = compareTwoWorkspaceMigrationObjectInput({
      from,
      to,
    });

    objectWorkspaceActions.push({
      uniqueIdentifier,
      type: 'update_object',
      updates: objectUpdatedProperties,
    });
  });

  return objectWorkspaceActions;
};
