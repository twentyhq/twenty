import {
  extractAndSanitizeObjectStringFields,
  isDefined,
} from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type UpdateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/update-field.input';
import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { ALL_OVERRIDABLE_PROPERTIES_BY_METADATA_NAME } from 'src/engine/metadata-modules/flat-entity/constant/all-overridable-properties-by-metadata-name.constant';
import { FLAT_FIELD_METADATA_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-field-metadata/constants/flat-field-metadata-editable-properties.constant';
import { type FlatFieldMetadataEditableProperties } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-editable-properties.constant';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { nullifyEmptyCompositeDefaultValue } from 'src/engine/metadata-modules/flat-field-metadata/utils/nullify-empty-composite-default-value.util';
import { belongsToTwentyStandardApp } from 'src/engine/metadata-modules/utils/belongs-to-twenty-standard-app.util';
import { computeMetadataOverridesBlob } from 'src/engine/metadata-modules/utils/compute-metadata-overrides-blob.util';

type SanitizeRawUpdateFieldInputArgs = {
  rawUpdateFieldInput: UpdateFieldInput;
  existingFlatFieldMetadata: FlatFieldMetadata;
  isSystemBuild: boolean;
};
export const sanitizeRawUpdateFieldInput = ({
  existingFlatFieldMetadata,
  rawUpdateFieldInput,
  isSystemBuild,
}: SanitizeRawUpdateFieldInputArgs) => {
  // Engine-owned side effects (e.g. default relation fields to standard objects)
  // are managed by the metadata side-effect engine; renames flow through the
  // owning object update, never through a direct field update by the user.
  if (existingFlatFieldMetadata.isSystemSideEffect === true && !isSystemBuild) {
    throw new FieldMetadataException(
      `Cannot edit system-managed field "${existingFlatFieldMetadata.name}"`,
      FieldMetadataExceptionCode.FIELD_MUTATION_NOT_ALLOWED,
    );
  }

  const isStandardField = belongsToTwentyStandardApp(existingFlatFieldMetadata);
  const updatedEditableFieldProperties = extractAndSanitizeObjectStringFields(
    rawUpdateFieldInput,
    [
      ...new Set([
        ...FLAT_FIELD_METADATA_EDITABLE_PROPERTIES.standard,
        ...FLAT_FIELD_METADATA_EDITABLE_PROPERTIES.custom,
      ]),
    ],
  );

  updatedEditableFieldProperties.options = !isDefined(
    updatedEditableFieldProperties.options,
  )
    ? updatedEditableFieldProperties.options
    : updatedEditableFieldProperties.options.map((option) => ({
        id: v4(),
        ...option,
      }));

  if (
    updatedEditableFieldProperties.defaultValue !== undefined &&
    isCompositeFieldMetadataType(existingFlatFieldMetadata.type)
  ) {
    updatedEditableFieldProperties.defaultValue =
      nullifyEmptyCompositeDefaultValue({
        defaultValue: updatedEditableFieldProperties.defaultValue,
        fieldType: existingFlatFieldMetadata.type,
      });
  }

  if (!isStandardField || isSystemBuild) {
    return {
      updatedEditableFieldProperties,
      overrides: null,
    };
  }

  const invalidUpdatedProperties = Object.keys(
    updatedEditableFieldProperties,
  ).filter(
    (property: FlatFieldMetadataEditableProperties) =>
      !FLAT_FIELD_METADATA_EDITABLE_PROPERTIES.standard.includes(
        property as (typeof FLAT_FIELD_METADATA_EDITABLE_PROPERTIES.standard)[number],
      ),
  );

  if (invalidUpdatedProperties.length > 0) {
    throw new FieldMetadataException(
      `Cannot edit standard field metadata properties: ${invalidUpdatedProperties.join(', ')}`,
      FieldMetadataExceptionCode.FIELD_MUTATION_NOT_ALLOWED,
    );
  }

  const { overrides, remainingProperties } = computeMetadataOverridesBlob({
    overridableProperties:
      ALL_OVERRIDABLE_PROPERTIES_BY_METADATA_NAME.fieldMetadata,
    updatedProperties: updatedEditableFieldProperties,
    existingEntity: existingFlatFieldMetadata,
    existingOverrides: existingFlatFieldMetadata.overrides,
  });

  return {
    overrides,
    updatedEditableFieldProperties: remainingProperties,
  };
};
