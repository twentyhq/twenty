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
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import {
  FLAT_FIELD_METADATA_EDITABLE_PROPERTIES,
  FLAT_FIELD_METADATA_SYSTEM_SIDE_EFFECT_EDITABLE_PROPERTIES,
} from 'src/engine/metadata-modules/flat-field-metadata/constants/flat-field-metadata-editable-properties.constant';
import { type FlatFieldMetadataEditableProperties } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-editable-properties.constant';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { nullifyEmptyCompositeDefaultValue } from 'src/engine/metadata-modules/flat-field-metadata/utils/nullify-empty-composite-default-value.util';
import { belongsToTwentyStandardApp } from 'src/engine/metadata-modules/utils/belongs-to-twenty-standard-app.util';
import { dispatchUpdateToAuthoredOverride } from 'src/engine/metadata-modules/overrides/utils/dispatch-update-to-authored-override.util';
import { findInvalidTranslationOverrideProperties } from 'src/engine/metadata-modules/overrides/utils/find-invalid-translation-override-properties.util';
import { mergeTranslationsIntoOverrides } from 'src/engine/metadata-modules/overrides/utils/merge-translations-into-overrides.util';

type SanitizeRawUpdateFieldInputArgs = {
  rawUpdateFieldInput: UpdateFieldInput;
  existingFlatFieldMetadata: FlatFieldMetadata;
  isSystemBuild: boolean;
  workspaceCustomApplicationUniversalIdentifier: string;
};
// Workspace edits of standard fields are authored by the workspace custom
// application, whatever the caller: an application never overrides another's.
export const sanitizeRawUpdateFieldInput = ({
  existingFlatFieldMetadata,
  rawUpdateFieldInput,
  isSystemBuild,
  workspaceCustomApplicationUniversalIdentifier,
}: SanitizeRawUpdateFieldInputArgs) => {
  const authorContext = {
    workspaceCustomApplicationUniversalIdentifier,
    ownerApplicationUniversalIdentifier:
      existingFlatFieldMetadata.applicationUniversalIdentifier,
  };
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

  if (existingFlatFieldMetadata.isSystemSideEffect === true && !isSystemBuild) {
    const forbiddenUpdatedProperties = [
      ...Object.keys(updatedEditableFieldProperties),
      ...(isDefined(rawUpdateFieldInput.morphRelationsUpdatePayload)
        ? ['morphRelationsUpdatePayload']
        : []),
    ].filter(
      (property) =>
        !FLAT_FIELD_METADATA_SYSTEM_SIDE_EFFECT_EDITABLE_PROPERTIES.includes(
          property as (typeof FLAT_FIELD_METADATA_SYSTEM_SIDE_EFFECT_EDITABLE_PROPERTIES)[number],
        ),
    );

    if (forbiddenUpdatedProperties.length > 0) {
      throw new FieldMetadataException(
        `Cannot edit system-managed field "${existingFlatFieldMetadata.name}" properties: ${forbiddenUpdatedProperties.join(', ')}`,
        FieldMetadataExceptionCode.FIELD_MUTATION_NOT_ALLOWED,
      );
    }
  }

  if (
    (updatedEditableFieldProperties.isSearchable as boolean | null) === null
  ) {
    updatedEditableFieldProperties.isSearchable = false;
  }

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

  const translationEntries = rawUpdateFieldInput.translations ?? [];
  const invalidTranslationProperties = findInvalidTranslationOverrideProperties(
    translationEntries,
    'fieldMetadata',
  );

  if (invalidTranslationProperties.length > 0) {
    throw new FieldMetadataException(
      `Cannot translate field metadata properties: ${invalidTranslationProperties.join(', ')}`,
      FieldMetadataExceptionCode.FIELD_MUTATION_NOT_ALLOWED,
    );
  }

  if (!isStandardField || isSystemBuild) {
    return {
      updatedEditableFieldProperties,
      overrides: mergeTranslationsIntoOverrides({
        existingOverrides: existingFlatFieldMetadata.overrides,
        translationEntries,
        authorUniversalIdentifier:
          workspaceCustomApplicationUniversalIdentifier,
      }),
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

  const { overrides, columnProperties } = dispatchUpdateToAuthoredOverride({
    metadataName: 'fieldMetadata',
    updatedProperties: updatedEditableFieldProperties,
    existingEntity: existingFlatFieldMetadata,
    existingOverrides: existingFlatFieldMetadata.overrides,
    authorUniversalIdentifier: workspaceCustomApplicationUniversalIdentifier,
    authorContext,
  });

  return {
    overrides: mergeTranslationsIntoOverrides({
      existingOverrides: overrides,
      translationEntries,
      authorUniversalIdentifier: workspaceCustomApplicationUniversalIdentifier,
    }),
    updatedEditableFieldProperties: columnProperties,
  };
};
