import diff, { DifferenceCreate } from 'microdiff';
import { FieldMetadataType } from 'twenty-shared/types';

import {
  CreateFieldAction,
  WorkspaceMigrationFieldActionV2,
} from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-field-action-v2';
import { WorkspaceMigrationObjectFieldInput } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-field-input';
import {
  getWorkspaceMigrationV2FieldCreateAction,
  getWorkspaceMigrationV2FieldDeleteAction,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/utils/get-workspace-migration-v2-field-actions';
import { UniqueIdentifierWorkspaceMigrationObjectInputMapDispatcher } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/workspace-migration-builder-v2.service';
import { CreatedDeletedUpdatedObjectMetadataInputMatrix } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/workspace-migration-v2-object-actions-builder';
import { transformMetadataForComparison } from 'src/engine/workspace-manager/workspace-sync-metadata/comparators/utils/transform-metadata-for-comparison.util';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { FromTo, ObjectMetadataUniqueIdentifier } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-action-common-v2';
import { CreateRelationAction } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-relation-action-v2';
import {
  CustomDeletedCreatedUpdatedMatrix,
  deletedCreatedUpdatedMatrixDispatcher,
} from './utils/deleted-created-updated-matrix-dispatcher.util';

const getCreateWorkspaceMigrationFieldAction = ({
  fieldMetadata,
  objectMetadataUniqueIdentifier,
  difference
}: {
  fieldMetadata: FieldMetadataEntity;
  difference: DifferenceCreate,
} & ObjectMetadataUniqueIdentifier): CreateRelationAction | CreateFieldAction => {
  switch (fieldMetadata.type) {
    case FieldMetadataType.RELATION: {
      return {
        type: 'create_relation',
        relationTargetFieldMetadata:
      }
    }
    default: {
      return {
        type: 'create_field',
        field: difference.value,
        fieldMetadataUniqueIdentifier: 'TODO',
        objectMetadataUniqueIdentifier,
      };
    }
  }
};

// Start TODO prastoin refactor and strictly type
const commonFieldPropertiesToIgnore = [
  'id',
  'createdAt',
  'updatedAt',
  'objectMetadataId',
  'isActive',
  'options',
  'settings',
  'joinColumn',
  'gate',
  'asExpression',
  'generatedType',
  'isLabelSyncedWithName',
  // uniqueIdentifier ?
];

const shouldNotOverrideDefaultValue = (type: FieldMetadataType) => {
  return [
    FieldMetadataType.BOOLEAN,
    FieldMetadataType.SELECT,
    FieldMetadataType.MULTI_SELECT,
    FieldMetadataType.CURRENCY,
    FieldMetadataType.PHONES,
    FieldMetadataType.ADDRESS,
  ].includes(type);
};

const fieldPropertiesToStringify = ['defaultValue'] as const;
/// End

export const compareTwoWorkspaceMigrationFieldInput = ({
  from,
  to,
}: FromTo<WorkspaceMigrationObjectFieldInput>) => {
  const compareFieldMetadataOptions = {
    shouldIgnoreProperty: (
      property: string,
      fieldMetadata: WorkspaceMigrationObjectFieldInput,
    ) => {
      if (
        property === 'defaultValue' &&
        shouldNotOverrideDefaultValue(fieldMetadata.type)
      ) {
        return true;
      }

      if (commonFieldPropertiesToIgnore.includes(property)) {
        return true;
      }

      return false;
    },
    propertiesToStringify: fieldPropertiesToStringify,
  };
  const fromCompare = transformMetadataForComparison(
    from,
    compareFieldMetadataOptions,
  );
  const toCompare = transformMetadataForComparison(
    to,
    compareFieldMetadataOptions,
  );

  const fieldMetadataDifference = diff(fromCompare, toCompare);

  return fieldMetadataDifference;
};

type BuildWorkspaceMigrationV2FieldActionFromUpdatedFieldMetadataArgs =
  FromTo<WorkspaceMigrationObjectFieldInput> & ObjectMetadataUniqueIdentifier
// Still in wip
const buildWorkspaceMigrationV2FieldActionFromUpdatedFieldMetadata = ({
  objectMetadataUniqueIdentifier,
  from,
  to,
}: BuildWorkspaceMigrationV2FieldActionFromUpdatedFieldMetadataArgs) => {
  const fieldMetadataDifferences = compareTwoWorkspaceMigrationFieldInput({
    from,
    to,
  });

  return fieldMetadataDifferences.flatMap<WorkspaceMigrationFieldActionV2>(
    (difference) => {
      switch (difference.type) {
        case 'CREATE': {
          return {
            type: 'create_field',
            field: difference.value,
            fieldMetadataUniqueIdentifier: 'TODO',
            objectMetadataUniqueIdentifier,
          };
        }
        case 'CHANGE': {
          // TODO prastoin
          return [];
        }
        case 'REMOVE': {
          return {
            type: 'delete_field',
            fieldMetadataUniqueIdentifier: difference.oldValue.uniqueIdentifier,
            objectMetadataUniqueIdentifier,
          };
        }
        default: {
          return [];
        }
      }
    },
  );
};

type DeletedCreatedUpdatedFieldInputMatrix = {
  objectMetadataUniqueIdentifier: string;
} & CustomDeletedCreatedUpdatedMatrix<
  'fieldMetadata',
  WorkspaceMigrationObjectFieldInput
>;

const updatedFieldMetadataMatriceMapDispatcher = (
  updatedObjectMetadata: UniqueIdentifierWorkspaceMigrationObjectInputMapDispatcher['updated'],
): DeletedCreatedUpdatedFieldInputMatrix[] => {
  const matriceAccumulator: DeletedCreatedUpdatedFieldInputMatrix[] = [];

  for (const { from, to } of updatedObjectMetadata) {
    const matrixResult = deletedCreatedUpdatedMatrixDispatcher({
      from: from.fields,
      to: to.fields,
    });

    matriceAccumulator.push({
      objectMetadataUniqueIdentifier: from.uniqueIdentifier,
      createdFieldMetadata: matrixResult.created,
      deletedFieldMetadata: matrixResult.deleted,
      updatedFieldMetadata: matrixResult.updated,
    });
  }

  return matriceAccumulator;
};

type BuildWorkspaceMigrationV2FieldActionsArgs = Pick<
  CreatedDeletedUpdatedObjectMetadataInputMatrix,
  'updatedObjectMetadata'
>;
export const buildWorkspaceMigrationV2FieldActions = ({
  updatedObjectMetadata,
}: BuildWorkspaceMigrationV2FieldActionsArgs): WorkspaceMigrationFieldActionV2[] => {
  const objectMetadataDeletedCreatedUpdatedFields =
    updatedFieldMetadataMatriceMapDispatcher(updatedObjectMetadata);

  let allUpdatedObjectMetadataFieldActions: WorkspaceMigrationFieldActionV2[] =
    [];

  for (const {
    createdFieldMetadata,
    deletedFieldMetadata,
    objectMetadataUniqueIdentifier,
    updatedFieldMetadata,
  } of objectMetadataDeletedCreatedUpdatedFields) {
    const updateFieldAction =
      updatedFieldMetadata.flatMap<WorkspaceMigrationFieldActionV2>(
        ({ from, to }) =>
          buildWorkspaceMigrationV2FieldActionFromUpdatedFieldMetadata({
            from,
            to,
            objectMetadataUniqueIdentifier: objectMetadataUniqueIdentifier,
          }),
      );

    const createFieldAction = createdFieldMetadata.map((field) =>
      getWorkspaceMigrationV2FieldCreateAction({
        field,
        objectMetadataUniqueIdentifier,
      }),
    );

    const deleteFieldAction = deletedFieldMetadata.map((field) =>
      getWorkspaceMigrationV2FieldDeleteAction({
        field,
        objectMetadataUniqueIdentifier,
      }),
    );

    allUpdatedObjectMetadataFieldActions =
      allUpdatedObjectMetadataFieldActions.concat([
        ...createFieldAction,
        ...deleteFieldAction,
        ...updateFieldAction,
      ]);
  }

  return allUpdatedObjectMetadataFieldActions;
};
