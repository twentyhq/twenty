import { isBoolean, isNull, isNumber, isString } from '@sniptt/guards';
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

const readOverride = (
  { overrides }: FieldMetadataOptionRowForOptions,
  property: 'label' | 'color' | 'position' | 'isActive',
): unknown =>
  readAuthoredOverrideProperty({
    metadataName: 'fieldMetadataOption',
    overrides,
    path: [property],
    // The caches are built without an author, so a workspace override is read before the owner's
    authorContext: { ownerApplicationUniversalIdentifier: undefined },
  });

const resolveEffectiveOptionRow = (
  fieldMetadataOptionRow: FieldMetadataOptionRowForOptions,
): FieldMetadataOptionRowForOptions => {
  const label = readOverride(fieldMetadataOptionRow, 'label');
  const color = readOverride(fieldMetadataOptionRow, 'color');
  const position = readOverride(fieldMetadataOptionRow, 'position');
  const isActive = readOverride(fieldMetadataOptionRow, 'isActive');

  return {
    ...fieldMetadataOptionRow,
    label: isString(label) ? label : fieldMetadataOptionRow.label,
    color:
      isString(color) || isNull(color) ? color : fieldMetadataOptionRow.color,
    position: isNumber(position) ? position : fieldMetadataOptionRow.position,
    isActive: isBoolean(isActive) ? isActive : fieldMetadataOptionRow.isActive,
  };
};

// A field without rows predates the option table or its backfill, so its stored options still stand.
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
