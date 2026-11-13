import {
  isDefined,
  isFieldMetadataOptionActive,
  isNonEmptyArray,
} from 'twenty-shared/utils';

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

const isOwnedByAnotherApplicationThanField = ({
  optionApplicationId,
  fieldApplicationId,
}: {
  optionApplicationId: string | undefined;
  fieldApplicationId: string | undefined;
}): boolean =>
  isDefined(optionApplicationId) &&
  isDefined(fieldApplicationId) &&
  optionApplicationId !== fieldApplicationId;

export const resolveFieldMetadataOptionsFromRows = ({
  fieldMetadataEntity,
  fieldMetadataOptionRows,
  shouldRowsCoverStoredOptions = false,
  shouldApplyOverrides = true,
}: {
  fieldMetadataEntity: Pick<FieldMetadataEntity, 'type' | 'options'> &
    Partial<Pick<FieldMetadataEntity, 'applicationId'>>;
  fieldMetadataOptionRows: FieldMetadataOptionRowForOptions[] | undefined;
  shouldRowsCoverStoredOptions?: boolean;
  shouldApplyOverrides?: boolean;
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
      shouldApplyOverrides
        ? resolveEffectiveFlatEntity({
            metadataName: 'fieldMetadataOption',
            flatEntity: fieldMetadataOptionRow,
          })
        : fieldMetadataOptionRow,
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
        ...(isFieldMetadataOptionActive({ isActive })
          ? {}
          : { isActive: false }),
        ...(isOwnedByAnotherApplicationThanField({
          optionApplicationId: applicationId,
          fieldApplicationId: fieldMetadataEntity.applicationId,
        })
          ? { applicationId }
          : {}),
      }),
    );
};
