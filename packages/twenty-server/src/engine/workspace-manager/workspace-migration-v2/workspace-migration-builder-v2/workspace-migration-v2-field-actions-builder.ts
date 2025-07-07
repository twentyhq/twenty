import diff from 'microdiff';
import { FieldMetadataType } from 'twenty-shared/types';

import {
  UpdateFieldAction,
  WorkspaceMigrationFieldActionV2,
} from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-field-action-v2';
import {
  FieldMetadataEntityEditableProperties,
  WorkspaceMigrationFieldInput,
  fieldMetadataEntityEditableProperties,
} from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-field-input';
import {
  getWorkspaceMigrationV2FieldCreateAction,
  getWorkspaceMigrationV2FieldDeleteAction,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/utils/get-workspace-migration-v2-field-actions';
import {
  UniqueIdentifierWorkspaceMigrationObjectInputMapDispatcher,
  UpdatedObjectMetadataFieldAndRelationMatrix,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/workspace-migration-builder-v2.service';
import { transformMetadataForComparison } from 'src/engine/workspace-manager/workspace-sync-metadata/comparators/utils/transform-metadata-for-comparison.util';

import { isRelationFieldMetadataType } from 'src/engine/utils/is-relation-field-metadata-type.util';
import { FromTo } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-action-common-v2';
import { WorkspaceMigrationObjectInput } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-object-input';
import { compareFieldMetadataInputAndGetUpdateFieldActions } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/utils/workspace-migration-field-metadata-input-comparator.util';
import {
  CustomDeletedCreatedUpdatedMatrix,
  deletedCreatedUpdatedMatrixDispatcher,
} from './utils/deleted-created-updated-matrix-dispatcher.util';

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
}: FromTo<WorkspaceMigrationFieldInput>) => {
  const compareFieldMetadataOptions = {
    shouldIgnoreProperty: (
      property: string,
      fieldMetadata: WorkspaceMigrationFieldInput,
    ) => {
      if (
        !fieldMetadataEntityEditableProperties.includes(
          property as FieldMetadataEntityEditableProperties,
        )
      ) {
        return true;
      }

      if (
        property === 'defaultValue' &&
        shouldNotOverrideDefaultValue(fieldMetadata.type)
      ) {
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

type DeletedCreatedUpdatedFieldInputMatrix = {
  objectMetadataInput: WorkspaceMigrationObjectInput; // Should omit fields and fieldsInputs
} & CustomDeletedCreatedUpdatedMatrix<
  'fieldMetadata',
  WorkspaceMigrationFieldInput
>;

const computeUpdatedObjectMetadataFieldMatriceDispatcher = (
  updatedObjectMetadata: UniqueIdentifierWorkspaceMigrationObjectInputMapDispatcher['updated'],
): DeletedCreatedUpdatedFieldInputMatrix[] => {
  const matriceAccumulator: DeletedCreatedUpdatedFieldInputMatrix[] = [];

  for (const { from, to } of updatedObjectMetadata) {
    const matrixResult = deletedCreatedUpdatedMatrixDispatcher({
      from: from.fieldInputs,
      to: to.fieldInputs,
    });

    matriceAccumulator.push({
      objectMetadataInput: to,
      createdFieldMetadata: matrixResult.created,
      deletedFieldMetadata: matrixResult.deleted,
      updatedFieldMetadata: matrixResult.updated,
    });
  }

  return matriceAccumulator;
};

export const buildWorkspaceMigrationV2FieldActions = (
  objectMetadataDeletedCreatedUpdatedFields: UpdatedObjectMetadataFieldAndRelationMatrix[],
): WorkspaceMigrationFieldActionV2[] => {
  let allUpdatedObjectMetadataFieldActions: WorkspaceMigrationFieldActionV2[] =
    [];

  for (const {
    createdFieldMetadata,
    deletedFieldMetadata,
    updatedFieldMetadata,
    objectMetadataInput,
  } of objectMetadataDeletedCreatedUpdatedFields) {
    // make more readable
    const updateFieldActions = updatedFieldMetadata
      .filter(({ to: toField }) => !isRelationFieldMetadataType(toField.type))
      .flatMap(({ from, to }) =>
        compareFieldMetadataInputAndGetUpdateFieldActions({
          from,
          to,
          objectMetadataInput,
        }),
      )
      .map<UpdateFieldAction>((updateFieldAction) => ({
        ...updateFieldAction,
        type: 'update_field',
      }));

    const createFieldAction = createdFieldMetadata.map((fieldMetadataInput) =>
      getWorkspaceMigrationV2FieldCreateAction({
        fieldMetadataInput,
        objectMetadataInput,
      }),
    );

    const deleteFieldAction = deletedFieldMetadata.map((fieldMetadataInput) =>
      getWorkspaceMigrationV2FieldDeleteAction({
        fieldMetadataInput,
        objectMetadataInput,
      }),
    );

    allUpdatedObjectMetadataFieldActions =
      allUpdatedObjectMetadataFieldActions.concat([
        ...createFieldAction,
        ...deleteFieldAction,
        ...updateFieldActions,
      ]);
  }

  return allUpdatedObjectMetadataFieldActions;
};
