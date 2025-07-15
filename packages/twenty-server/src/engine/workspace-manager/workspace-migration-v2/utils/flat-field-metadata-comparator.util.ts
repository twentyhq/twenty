import diff from 'microdiff';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { FlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration-v2/types/flat-field-metadata';
import { FromTo } from 'src/engine/workspace-manager/workspace-migration-v2/types/from-to.type';
import { UpdateFieldAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-field-action-v2';
import { transformMetadataForComparison } from 'src/engine/workspace-manager/workspace-sync-metadata/comparators/utils/transform-metadata-for-comparison.util';

const flatFieldMetadataPropertiesToCompare = [
  'defaultValue',
  'description',
  'icon',
  'isActive',
  'isLabelSyncedWithName',
  'isUnique',
  'label',
  'name',
  'options',
  'standardOverrides',
] as const satisfies (keyof FlatFieldMetadata)[];

export type FlatFieldMetadataPropertiesToCompare =
  (typeof flatFieldMetadataPropertiesToCompare)[number];

const fieldMetadataPropertiesToStringify = [
  'defaultValue',
  'standardOverrides',
] as const satisfies FlatFieldMetadataPropertiesToCompare[];

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

type GetWorkspaceMigrationUpdateFieldActionArgs = FromTo<FlatFieldMetadata>;
export const compareTwoFlatFieldMetadata = ({
  from,
  to,
}: GetWorkspaceMigrationUpdateFieldActionArgs) => {
  const compareFieldMetadataOptions = {
    shouldIgnoreProperty: (
      property: string,
      fieldMetadata: FlatFieldMetadata,
    ) => {
      if (
        !flatFieldMetadataPropertiesToCompare.includes(
          property as FlatFieldMetadataPropertiesToCompare,
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

  const flatFieldMetadataDifferences = diff(fromCompare, toCompare);

  return flatFieldMetadataDifferences.flatMap<
    UpdateFieldAction['updates'][number]
  >((difference) => {
    switch (difference.type) {
      case 'CHANGE': {
        const { oldValue, path, value } = difference;

        return {
          from: oldValue,
          to: value,
          property: path[0] as FlatFieldMetadataPropertiesToCompare,
        };
      }
      case 'CREATE':
      case 'REMOVE':
      default: {
        // Should never occurs, we should only provide null never undefined and so on
        return [];
      }
    }
  });
};
