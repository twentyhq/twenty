import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { type FieldMetadataOptionEntity } from 'src/engine/metadata-modules/field-metadata-option/entities/field-metadata-option.entity';
import { isEnumFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-enum-field-metadata-type.util';
import { resolveEffectiveFlatEntity } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-flat-entity.util';

export type FieldMetadataOptionRowForOptions = Pick<
  FieldMetadataOptionEntity,
  'universalIdentifier' | 'value' | 'label' | 'color' | 'position'
> &
  Partial<
    Pick<FieldMetadataOptionEntity, 'overrides' | 'isActive' | 'applicationId'>
  >;

// Stored options stand for a field without rows and, with shouldRowsCoverStoredOptions, while one has no row.
export const resolveFieldMetadataOptionsFromRows = ({
  fieldMetadataEntity,
  fieldMetadataOptionRows,
  shouldRowsCoverStoredOptions = false,
}: {
  fieldMetadataEntity: Pick<FieldMetadataEntity, 'type' | 'options'> &
    Partial<Pick<FieldMetadataEntity, 'applicationId'>>;
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

  // Caches are built without an author, so a workspace override is read before the owner's.
  return fieldMetadataOptionRows
    .map((fieldMetadataOptionRow) =>
      resolveEffectiveFlatEntity({
        metadataName: 'fieldMetadataOption',
        flatEntity: fieldMetadataOptionRow,
      }),
    )
    .sort(
      (first, second) =>
        first.position - second.position ||
        first.universalIdentifier.localeCompare(second.universalIdentifier),
    )
    .map(
      ({
        universalIdentifier,
        value,
        label,
        color,
        position,
        isActive,
        applicationId,
      }) => ({
        id: universalIdentifier,
        value,
        label,
        position,
        ...(isDefined(color) ? { color } : {}),
        ...(isActive === false ? { isActive: false } : {}),
        ...(isDefined(applicationId) &&
        isDefined(fieldMetadataEntity.applicationId) &&
        applicationId !== fieldMetadataEntity.applicationId
          ? { applicationId }
          : {}),
      }),
    );
};
