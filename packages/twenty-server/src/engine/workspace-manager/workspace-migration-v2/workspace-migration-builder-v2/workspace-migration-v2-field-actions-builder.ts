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
import { transformMetadataForComparison } from 'src/engine/workspace-manager/workspace-sync-metadata/comparators/utils/transform-metadata-for-comparison.util';

import { FromTo } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-action-common-v2';
import { UpdatedObjectMetadataFieldAndRelationMatrix } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/utils/compute-updated-object-metadata-field-and-relations-delete-created-updated-matrix.util';
import { compareFieldMetadataInputAndGetUpdateFieldActions } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/utils/workspace-migration-field-metadata-input-comparator.util';
import { isDefined } from 'twenty-shared/utils';

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
        isDefined(fieldMetadata.type) &&
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
    const updateFieldActions = updatedFieldMetadata.flatMap<UpdateFieldAction>(
      ({ from, to }) => {
        const updates = compareFieldMetadataInputAndGetUpdateFieldActions({
          from,
          to,
        });

        if (updates.length === 0) {
          return [];
        }

        return {
          type: 'update_field',
          fieldMetadataInput: to,
          objectMetadataInput,
          updates,
        };
      },
    );

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
