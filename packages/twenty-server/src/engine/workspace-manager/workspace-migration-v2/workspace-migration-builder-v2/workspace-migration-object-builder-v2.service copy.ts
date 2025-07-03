import omit from 'lodash.omit';
import diff from 'microdiff';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import {
  FromTo,
  UpdateObjectAction,
  WorkspaceMigrationActionV2,
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

// Should return WorkspaceObjectMigrationV2 ?
export const buildWorkspaceObjectMigrationV2 = ({
  from,
  to,
}: BuildWorkspaceMigrationV2Args): WorkspaceMigrationV2[] => {
  const deletedObjectMetadata = from.filter((fromObject) =>
    to.find(
      (toObject) => toObject.uniqueIdentifier === fromObject.uniqueIdentifier,
    ),
  );
  const createdObjectMetadata = to.filter((toObject) =>
    from.find(
      (fromObject) => fromObject.uniqueIdentifier === toObject.uniqueIdentifier,
    ),
  );
  const updatedObjectMetadat: FromTo<WorkspaceMigrationObjectInput>[] = []; // Get by elimination

  const actions: WorkspaceMigrationActionV2[] = [];
  const updateMigrationsDiffResults = updatedObjectMetadat.map(
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
