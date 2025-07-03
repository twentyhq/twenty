import omit from 'lodash.omit';
import diff from 'microdiff';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import {
  FromTo,
  UpdateObjectAction,
  WorkspaceMigrationObjectActionV2,
} from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-action-v2';
import { WorkspaceMigrationObjectInput } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-object-input';
import { WorkspaceMigrationV2 } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-v2';
import { transformMetadataForComparison } from 'src/engine/workspace-manager/workspace-sync-metadata/comparators/utils/transform-metadata-for-comparison.util';
import { assertUnreachable } from 'twenty-shared/utils';

type BuildWorkspaceMigrationV2Args = {
  from: WorkspaceMigrationObjectInput[];
  to: WorkspaceMigrationObjectInput[];
};

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
  const objectPropertiesToUpdate: UpdateObjectAction['object'] = {
    from: {},
    to: {},
  };

  return objectMetadataDifference.reduce((acc, difference) => {
    switch (difference.type) {
      case 'CHANGE': {
        if (
          difference.oldValue === null &&
          (difference.value === null || difference.value === undefined)
        ) {
          return acc;
        }
        const property = difference.path[0];

        // TODO investigate why it would be a number, in case of array I guess ?
        if (typeof property === 'number') {
          return acc;
        }

        // Could be handled directly from the diff we do above
        if (
          !allowedObjectProps.includes(property as keyof ObjectMetadataEntity)
        ) {
          return acc;
        }

        return {
          from: difference.oldValue,
          to: difference.value,
        };
      }
      case 'CREATE':
      case 'REMOVE': {
        // Should never occurs ?
        return acc;
      }
      default: {
        assertUnreachable(difference, 'TODO');
      }
    }
  }, objectPropertiesToUpdate);
};

const objectMetadataDispatcher = ({
  from,
  to,
}: BuildWorkspaceMigrationV2Args) => {
  const initialDispatcher: {
    deleted: WorkspaceMigrationObjectInput[];
    created: WorkspaceMigrationObjectInput[];
    updated: FromTo<WorkspaceMigrationObjectInput>[];
  } = {
    deleted: [],
    updated: [],
    created: [],
  };

  // Create maps for faster lookups
  const fromMap = new Map(from.map((obj) => [obj.uniqueIdentifier, obj]));
  const toMap = new Map(to.map((obj) => [obj.uniqueIdentifier, obj]));

  // Find deleted objects (exist in 'from' but not in 'to')
  for (const [identifier, fromObj] of fromMap) {
    if (!toMap.has(identifier)) {
      initialDispatcher.deleted.push(fromObj);
    }
  }

  // Find created objects (exist in 'to' but not in 'from')
  for (const [identifier, toObj] of toMap) {
    if (!fromMap.has(identifier)) {
      initialDispatcher.created.push(toObj);
    }
  }

  // Find updated objects (exist in both, need to compare)
  for (const [identifier, fromObj] of fromMap) {
    const toObj = toMap.get(identifier);
    if (toObj) {
      initialDispatcher.updated.push({
        from: fromObj,
        to: toObj,
      });
    }
  }

  return initialDispatcher;
};

// Should return WorkspaceObjectMigrationV2 ?
export const buildWorkspaceObjectMigrationV2 = (
  objectMetadataInputs: BuildWorkspaceMigrationV2Args,
): WorkspaceMigrationV2<WorkspaceMigrationObjectActionV2>[] => {
  const { created, deleted, updated } =
    objectMetadataDispatcher(objectMetadataInputs);
  const actions: WorkspaceMigrationObjectActionV2[] = [];

  created.forEach((objectMetadata) => {
    actions.push({
      type: 'create_object',
      object: objectMetadata, // TODO
    });
  });

  deleted.forEach((objectMetadata) => {
    actions.push({
      type: 'delete_object',
      objectMetadataId: objectMetadata.uniqueIdentifier,
    });
  });

  const updateMigrationsDiffResults = updated.map(
    compareTwoWorkspaceMigrationObjectInput,
  );
  updateMigrationsDiffResults.forEach((objectUpdatedProperties) => {
    actions.push({
      type: 'update_object',
      object: objectUpdatedProperties,
    });
  });

  if (actions.length === 0) return [];

  return [{ actions }];
};
