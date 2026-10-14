import { APP_LOCALES } from 'twenty-shared/translations';
import {
  extractAndSanitizeObjectStringFields,
  isDefined,
  isFieldMetadataSelectKind,
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
import { getFlatFieldMetadataOptionLabelTranslationProperties } from 'src/engine/metadata-modules/flat-field-metadata/utils/get-flat-field-metadata-option-label-translation-properties.util';
import { nullifyEmptyCompositeDefaultValue } from 'src/engine/metadata-modules/flat-field-metadata/utils/nullify-empty-composite-default-value.util';
import { sanitizeSelectOptionColors } from 'src/engine/metadata-modules/flat-field-metadata/utils/sanitize-select-option-colors.util';
import { belongsToTwentyStandardApp } from 'src/engine/metadata-modules/utils/belongs-to-twenty-standard-app.util';
import { dispatchUpdateToAuthoredOverride } from 'src/engine/metadata-modules/overrides/utils/dispatch-update-to-authored-override.util';
import { findInvalidTranslationOverrideProperties } from 'src/engine/metadata-modules/overrides/utils/find-invalid-translation-override-properties.util';
import { mergeTranslationsIntoOverrides } from 'src/engine/metadata-modules/overrides/utils/merge-translations-into-overrides.util';
import { type TranslationOverrideEntry } from 'src/engine/metadata-modules/overrides/types/translation-override-entry.type';

type SanitizeRawUpdateFieldInputArgs = {
  rawUpdateFieldInput: UpdateFieldInput;
  existingFlatFieldMetadata: FlatFieldMetadata;
  isSystemBuild: boolean;
  workspaceCustomApplicationUniversalIdentifier: string;
};
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

  if (isDefined(updatedEditableFieldProperties.options)) {
    const optionsWithIds = updatedEditableFieldProperties.options.map(
      (option) => ({
        id: v4(),
        ...option,
      }),
    );

    updatedEditableFieldProperties.options = isFieldMetadataSelectKind(
      existingFlatFieldMetadata.type,
    )
      ? sanitizeSelectOptionColors(optionsWithIds)
      : optionsWithIds;
  }

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

  const rawTranslationEntries = rawUpdateFieldInput.translations ?? [];
  const existingOptionLabelTranslationProperties =
    getFlatFieldMetadataOptionLabelTranslationProperties({
      type: existingFlatFieldMetadata.type,
      options: existingFlatFieldMetadata.options,
    });
  const optionLabelTranslationProperties = isDefined(
    updatedEditableFieldProperties.options,
  )
    ? getFlatFieldMetadataOptionLabelTranslationProperties({
        type: existingFlatFieldMetadata.type,
        options: updatedEditableFieldProperties.options,
      })
    : existingOptionLabelTranslationProperties;
  const invalidTranslationProperties = findInvalidTranslationOverrideProperties(
    rawTranslationEntries,
    'fieldMetadata',
  ).filter((property) => !optionLabelTranslationProperties.includes(property));

  if (invalidTranslationProperties.length > 0) {
    throw new FieldMetadataException(
      `Cannot translate field metadata properties: ${invalidTranslationProperties.join(', ')}`,
      FieldMetadataExceptionCode.FIELD_MUTATION_NOT_ALLOWED,
    );
  }

  const removedOptionLabelTranslationEntries: TranslationOverrideEntry[] =
    existingOptionLabelTranslationProperties
      .filter(
        (property) => !optionLabelTranslationProperties.includes(property),
      )
      .flatMap((property) =>
        (Object.keys(APP_LOCALES) as (keyof typeof APP_LOCALES)[]).map(
          (locale) => ({ locale, property, value: null }),
        ),
      );
  const translationEntries = [
    ...rawTranslationEntries,
    ...removedOptionLabelTranslationEntries,
  ];

  if (!isStandardField || isSystemBuild) {
    return {
      updatedEditableFieldProperties,
      overrides: mergeTranslationsIntoOverrides({
        metadataName: 'fieldMetadata',
        existingOverrides: existingFlatFieldMetadata.overrides,
        translationEntries,
        authorUniversalIdentifier:
          workspaceCustomApplicationUniversalIdentifier,
        authorContext,
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
      metadataName: 'fieldMetadata',
      existingOverrides: overrides,
      translationEntries,
      authorUniversalIdentifier: workspaceCustomApplicationUniversalIdentifier,
      authorContext,
    }),
    updatedEditableFieldProperties: columnProperties,
  };
};
