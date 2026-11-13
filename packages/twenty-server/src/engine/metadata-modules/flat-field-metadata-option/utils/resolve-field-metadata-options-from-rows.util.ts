import { type FieldMetadataType } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { type FieldMetadataOptionEntity } from 'src/engine/metadata-modules/field-metadata-option/entities/field-metadata-option.entity';
import { resolveEffectiveFlatEntity } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-flat-entity.util';
import { ENUM_FIELD_TYPES } from 'src/engine/metadata-modules/field-metadata/types/enum-field-metadata-type.type';

export type FieldMetadataOptionRowForOptions = Pick<
  FieldMetadataOptionEntity,
  'universalIdentifier' | 'value' | 'label' | 'color' | 'position'
> &
  Partial<
    Pick<FieldMetadataOptionEntity, 'overrides' | 'isActive' | 'applicationId'>
  >;

// A field without rows predates the option table or its backfill, so its stored options still stand.
// With shouldRowsCoverStoredOptions, they also stand while a stored option has no row yet, which is
// the state of a workspace the 2.59 alignment command has not reached.
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
    !(ENUM_FIELD_TYPES as readonly FieldMetadataType[]).includes(
      fieldMetadataEntity.type,
    ) ||
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

  return fieldMetadataOptionRows
    // Caches are built without an author, so a workspace override is read before the owner's.
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
    ) as FieldMetadataEntity['options'];
};
