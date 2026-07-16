import { differenceInDays } from 'date-fns';
import { isDefined } from 'twenty-shared/utils';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { MOSTLY_EMPTY_FIELD_MINIMUM_AGE_IN_DAYS } from 'src/engine/metadata-modules/object-metadata/constants/mostly-empty-field-minimum-age-in-days.constant';
import { MOSTLY_EMPTY_FRACTION_THRESHOLD } from 'src/engine/metadata-modules/object-metadata/constants/mostly-empty-fraction-threshold.constant';
import { getEmptinessColumnNamesForField } from 'src/engine/metadata-modules/object-metadata/utils/get-emptiness-column-names-for-field.util';

export type FieldMetadataForEmptinessCheck = Pick<
  FlatFieldMetadata,
  'id' | 'name' | 'type' | 'isActive' | 'isSystem' | 'createdAt'
>;

export const computeMostlyEmptyFieldMetadataIds = ({
  fieldMetadatas,
  labelIdentifierFieldMetadataId,
  emptyFractionByColumnName,
  now,
}: {
  fieldMetadatas: FieldMetadataForEmptinessCheck[];
  labelIdentifierFieldMetadataId: string | null;
  emptyFractionByColumnName: Map<string, number>;
  now: Date;
}): string[] => {
  return fieldMetadatas
    .filter((fieldMetadata) => {
      if (!fieldMetadata.isActive || fieldMetadata.isSystem) {
        return false;
      }

      // The label identifier cannot be deactivated, so hinting it is a dead end
      if (fieldMetadata.id === labelIdentifierFieldMetadataId) {
        return false;
      }

      const fieldAgeInDays = differenceInDays(
        now,
        new Date(fieldMetadata.createdAt),
      );

      if (fieldAgeInDays < MOSTLY_EMPTY_FIELD_MINIMUM_AGE_IN_DAYS) {
        return false;
      }

      const columnNames = getEmptinessColumnNamesForField(fieldMetadata);

      if (!isDefined(columnNames)) {
        return false;
      }

      // A column missing from statistics (e.g. added after the last ANALYZE)
      // means we don't know, and not knowing means no hint
      return columnNames.every((columnName) => {
        const emptyFraction = emptyFractionByColumnName.get(columnName);

        return (
          isDefined(emptyFraction) &&
          emptyFraction >= MOSTLY_EMPTY_FRACTION_THRESHOLD
        );
      });
    })
    .map((fieldMetadata) => fieldMetadata.id);
};
