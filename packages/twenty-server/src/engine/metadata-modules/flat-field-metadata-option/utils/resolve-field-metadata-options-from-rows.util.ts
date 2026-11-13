import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { type FieldMetadataOptionEntity } from 'src/engine/metadata-modules/field-metadata-option/entities/field-metadata-option.entity';
import { isEnumFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-enum-field-metadata-type.util';

export type FieldMetadataOptionRowForOptions = Pick<
  FieldMetadataOptionEntity,
  'universalIdentifier' | 'value' | 'label' | 'color' | 'position'
>;

// Stored options stand for a field without rows and, with shouldRowsCoverStoredOptions, while one has no row.
export const resolveFieldMetadataOptionsFromRows = ({
  fieldMetadataEntity,
  fieldMetadataOptionRows,
  shouldRowsCoverStoredOptions = false,
}: {
  fieldMetadataEntity: Pick<FieldMetadataEntity, 'type' | 'options'>;
  fieldMetadataOptionRows: FieldMetadataOptionRowForOptions[] | undefined;
  shouldRowsCoverStoredOptions?: boolean;
}): FieldMetadataEntity['options'] => {
  if (
    !isEnumFieldMetadataType(fieldMetadataEntity.type) ||
    !isNonEmptyArray(fieldMetadataOptionRows)
  ) {
    return fieldMetadataEntity.options;
  }

  const rowValues = new Set(fieldMetadataOptionRows.map(({ value }) => value));

  if (
    shouldRowsCoverStoredOptions &&
    (fieldMetadataEntity.options ?? []).some(
      ({ value }) => !rowValues.has(value),
    )
  ) {
    return fieldMetadataEntity.options;
  }

  return [...fieldMetadataOptionRows]
    .sort(
      (first, second) =>
        first.position - second.position ||
        first.universalIdentifier.localeCompare(second.universalIdentifier),
    )
    .map(({ universalIdentifier, value, label, color, position }) => ({
      id: universalIdentifier,
      value,
      label,
      position,
      ...(isDefined(color) ? { color } : {}),
    }));
};
