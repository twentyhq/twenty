import omit from 'lodash.omit';
import diff from 'microdiff';
import { assertUnreachable } from 'twenty-shared/utils';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import {
  FromTo,
  UpdateObjectAction,
  WorkspaceMigrationActionV2,
} from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-action-v2';
import { WorkspaceMigrationObjectInput } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-object-input';
import { CustomDeletedCreatedUpdatedMatrix } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/utils/deleted-created-updated-matrix-dispatcher.util';
import { getWorkspaceMigrationV2FieldCreateAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/utils/get-workspace-migration-v2-field-actions';
import {
  getWorkspaceMigrationV2ObjectCreateAction,
  getWorkspaceMigrationV2ObjectDeleteAction,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/utils/get-workspace-migration-v2-object-actions';
import { transformMetadataForComparison } from 'src/engine/workspace-manager/workspace-sync-metadata/comparators/utils/transform-metadata-for-comparison.util';

// Start TODO prastoin refactor and strictly type
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
/// End

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
  const createdObjectActions = createdObjectMetadata.flatMap(
    (objectMetadata) => {
      const createObjectAction =
        getWorkspaceMigrationV2ObjectCreateAction(objectMetadata);
      const createFieldActions = objectMetadata.fields.map((field) =>
        getWorkspaceMigrationV2FieldCreateAction({
          field,
          objectMetadataUniqueIdentifier: objectMetadata.uniqueIdentifier,
        }),
      );

      return [createObjectAction, ...createFieldActions];
    },
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
