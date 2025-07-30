import diff from 'microdiff';
import { FieldMetadataType, FromTo } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isRelationFieldMetadataType } from 'src/engine/utils/is-relation-field-metadata-type.util';
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
  'settings',
] as const satisfies (keyof FlatFieldMetadata)[];

export type FlatFieldMetadataPropertiesToCompare =
  (typeof flatFieldMetadataPropertiesToCompare)[number];

const fieldMetadataPropertiesToStringify = [
  'defaultValue',
  'standardOverrides',
  'settings',
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
/**
 * This comparator handles update on colliding uniqueIdentifier flatFieldMetadata
 */
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

      // Remove below assertion when we authorize relation edition, see https://github.com/twentyhq/twenty/commit/39f6f3c4bb101272a9014e142a842d0801a3c33b
      if (
        isDefined(fieldMetadata.type) &&
        isRelationFieldMetadataType(fieldMetadata.type) &&
        !['label', 'description', 'isActive'].includes(property)
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
