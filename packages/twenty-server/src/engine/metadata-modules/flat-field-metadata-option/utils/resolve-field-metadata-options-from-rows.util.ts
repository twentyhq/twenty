import { type FieldMetadataType } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { type FieldMetadataOptionEntity } from 'src/engine/metadata-modules/field-metadata-option/entities/field-metadata-option.entity';
import { readAuthoredOverrideProperty } from 'src/engine/metadata-modules/overrides/utils/read-authored-override-property.util';
import { ENUM_FIELD_TYPES } from 'src/engine/metadata-modules/field-metadata/types/enum-field-metadata-type.type';

export type FieldMetadataOptionRowForOptions = Pick<
  FieldMetadataOptionEntity,
  'universalIdentifier' | 'value' | 'label' | 'color' | 'position'
> &
  Partial<
    Pick<FieldMetadataOptionEntity, 'overrides' | 'isActive' | 'applicationId'>
  >;

const OVERRIDABLE_PROPERTIES = [
  'label',
  'color',
  'position',
  'isActive',
] as const;

const resolveEffectiveOptionRow = (
  fieldMetadataOptionRow: FieldMetadataOptionRowForOptions,
) => {
  const effectiveOptionRow: Record<string, unknown> = {
    ...fieldMetadataOptionRow,
  };

  for (const property of OVERRIDABLE_PROPERTIES) {
    const overrideValue = readAuthoredOverrideProperty({
      metadataName: 'fieldMetadataOption',
      overrides: fieldMetadataOptionRow.overrides,
      path: [property],
      authorContext: { ownerApplicationUniversalIdentifier: undefined },
    });

    if (overrideValue !== undefined) {
      effectiveOptionRow[property] = overrideValue;
    }
  }

  return effectiveOptionRow as FieldMetadataOptionRowForOptions;
};

// A field without rows predates the option table or its backfill, so its stored options still stand.
// An option carries isActive only when deactivated, and applicationId only when another application
// than its field owns it.
export const resolveFieldMetadataOptionsFromRows = ({
  fieldMetadataEntity,
  fieldMetadataOptionRows,
}: {
  fieldMetadataEntity: Pick<FieldMetadataEntity, 'type' | 'options'> &
    Partial<Pick<FieldMetadataEntity, 'applicationId'>>;
  fieldMetadataOptionRows: FieldMetadataOptionRowForOptions[] | undefined;
}): FieldMetadataEntity['options'] => {
  if (
    !(ENUM_FIELD_TYPES as readonly FieldMetadataType[]).includes(
      fieldMetadataEntity.type,
    ) ||
    !isNonEmptyArray(fieldMetadataOptionRows)
  ) {
    return fieldMetadataEntity.options;
  }

  return fieldMetadataOptionRows
    .map(resolveEffectiveOptionRow)
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
