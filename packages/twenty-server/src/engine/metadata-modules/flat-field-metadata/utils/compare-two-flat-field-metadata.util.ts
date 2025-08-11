import diff from 'microdiff';
import { FieldMetadataType, type FromTo } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type UpdateFieldAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-field-action-v2';
import { transformMetadataForComparison } from 'src/engine/workspace-manager/workspace-sync-metadata/comparators/utils/transform-metadata-for-comparison.util';

export const flatFieldMetadataPropertiesToCompare = [
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

export const flatFieldMetadataEntityJsonbProperties = [
  'defaultValue',
  'options',
  'settings',
  'standardOverrides',
] as const satisfies (keyof FlatFieldMetadata)[];
export type FlatFieldMetadataEntityJsonbProperties =
  (typeof flatFieldMetadataEntityJsonbProperties)[number];

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
        (fieldMetadata.type === FieldMetadataType.RELATION ||
          fieldMetadata.type === FieldMetadataType.MORPH_RELATION) &&
        !['label', 'description', 'isActive'].includes(property)
      ) {
        return true;
      }

      return false;
    },
    propertiesToStringify: flatFieldMetadataEntityJsonbProperties,
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
        const property = path[0] as FlatFieldMetadataPropertiesToCompare;
        const isJsonb = flatFieldMetadataEntityJsonbProperties.includes(
          property as FlatFieldMetadataEntityJsonbProperties,
        );

        if (isJsonb) {
          return {
            from: isDefined(oldValue) ? JSON.parse(oldValue) : oldValue,
            to: isDefined(value) ? JSON.parse(value) : value,
            property,
          };
        }

        return {
          from: oldValue,
          to: value,
          property,
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
