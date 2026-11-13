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
