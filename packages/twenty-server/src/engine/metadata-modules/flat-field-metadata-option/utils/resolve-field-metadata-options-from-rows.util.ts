import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { type FieldMetadataOptionEntity } from 'src/engine/metadata-modules/field-metadata-option/entities/field-metadata-option.entity';
import { isEnumFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-enum-field-metadata-type.util';

export type FieldMetadataOptionRowForOptions = Pick<
  FieldMetadataOptionEntity,
  'universalIdentifier' | 'value' | 'label' | 'color' | 'position'
>;

export const resolveFieldMetadataOptionsFromRows = ({
  fieldMetadataEntity,
  fieldMetadataOptionRows,
}: {
  fieldMetadataEntity: Pick<FieldMetadataEntity, 'type'> &
    Partial<Pick<FieldMetadataEntity, 'options'>>;
  fieldMetadataOptionRows: FieldMetadataOptionRowForOptions[] | undefined;
}): FieldMetadataEntity['options'] => {
  if (
    !isEnumFieldMetadataType(fieldMetadataEntity.type) ||
    !isNonEmptyArray(fieldMetadataOptionRows)
  ) {
    return fieldMetadataEntity.options ?? null;
  }

  const sortedFieldMetadataOptionRows = [...fieldMetadataOptionRows].sort(
    (first, second) =>
      first.position - second.position ||
      first.universalIdentifier.localeCompare(second.universalIdentifier),
  );
  // Rows of different applications can share a position, while option lists need distinct ones.
  const hasSharedPosition =
    new Set(sortedFieldMetadataOptionRows.map(({ position }) => position))
      .size < sortedFieldMetadataOptionRows.length;

  return sortedFieldMetadataOptionRows.map(
    ({ universalIdentifier, value, label, color, position }, index) => ({
      id: universalIdentifier,
      value,
      label,
      position: hasSharedPosition ? index : position,
      ...(isDefined(color) ? { color } : {}),
    }),
  );
};
