import diff from 'microdiff';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { FromTo } from 'src/engine/workspace-manager/workspace-migration-v2/types/from-to.type';
import { UpdateFieldAction } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-field-action-v2';
import {
  FieldMetadataEntityEditableProperties,
  WorkspaceMigrationFieldInput,
  fieldMetadataEntityEditableProperties,
  fieldMetadataPropertiesToStringify,
} from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-field-input';
import { transformMetadataForComparison } from 'src/engine/workspace-manager/workspace-sync-metadata/comparators/utils/transform-metadata-for-comparison.util';

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

const compareTwoWorkspaceMigrationFieldInput = ({
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
    propertiesToStringify: fieldMetadataPropertiesToStringify,
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

type GetWorkspaceMigrationUpdateFieldActionArgs =
  FromTo<WorkspaceMigrationFieldInput>;
export const compareFieldMetadataInputAndGetUpdateFieldActions = ({
  from,
  to,
}: GetWorkspaceMigrationUpdateFieldActionArgs) => {
  const fieldMetadataDifferences = compareTwoWorkspaceMigrationFieldInput({
    from,
    to,
  });

  return fieldMetadataDifferences.flatMap<UpdateFieldAction['updates'][number]>(
    (difference) => {
      switch (difference.type) {
        case 'CHANGE': {
          const { oldValue, path, value } = difference;

          return {
            from: oldValue,
            to: value,
            property: path[0] as FieldMetadataEntityEditableProperties,
          };
        }
        case 'CREATE':
        case 'REMOVE':
        default: {
          // Should never occurs, we should only provide null never undefined and so on
          return [];
        }
      }
    },
  );
};
