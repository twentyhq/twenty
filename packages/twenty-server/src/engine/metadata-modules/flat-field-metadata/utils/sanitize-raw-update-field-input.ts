import { format as formatDate } from 'date-fns';
import {
  DateDisplayFormat,
  FieldMetadataType,
} from 'twenty-shared/types';
import {
  extractAndSanitizeObjectStringFields,
  fastDeepEqual,
  isDefined,
} from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type UpdateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/update-field.input';
import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { ALL_OVERRIDABLE_PROPERTIES_BY_METADATA_NAME } from 'src/engine/metadata-modules/flat-entity/constant/all-overridable-properties-by-metadata-name.constant';
import {
  FLAT_FIELD_METADATA_EDITABLE_PROPERTIES,
  FLAT_FIELD_METADATA_SYSTEM_SIDE_EFFECT_EDITABLE_PROPERTIES,
} from 'src/engine/metadata-modules/flat-field-metadata/constants/flat-field-metadata-editable-properties.constant';
import { type FlatFieldMetadataEditableProperties } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-editable-properties.constant';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { nullifyEmptyCompositeDefaultValue } from 'src/engine/metadata-modules/flat-field-metadata/utils/nullify-empty-composite-default-value.util';
import { belongsToTwentyStandardApp } from 'src/engine/metadata-modules/utils/belongs-to-twenty-standard-app.util';
import { computeMetadataOverridesBlob } from 'src/engine/metadata-modules/utils/compute-metadata-overrides-blob.util';
import { findInvalidTranslationOverrideProperties } from 'src/engine/metadata-modules/utils/find-invalid-translation-override-properties.util';
import { mergeTranslationsIntoOverrides } from 'src/engine/metadata-modules/utils/merge-translations-into-overrides.util';

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
    const isSystemSideEffectDateField =
      existingFlatFieldMetadata.type === FieldMetadataType.DATE ||
      existingFlatFieldMetadata.type === FieldMetadataType.DATE_TIME;

    const allowedSystemSideEffectProperties: string[] = isSystemSideEffectDateField
      ? [...FLAT_FIELD_METADATA_SYSTEM_SIDE_EFFECT_EDITABLE_PROPERTIES, 'settings']
      : [...FLAT_FIELD_METADATA_SYSTEM_SIDE_EFFECT_EDITABLE_PROPERTIES];

    const forbiddenUpdatedProperties = [
      ...Object.keys(updatedEditableFieldProperties),
      ...(isDefined(rawUpdateFieldInput.morphRelationsUpdatePayload)
        ? ['morphRelationsUpdatePayload']
        : []),
    ].filter((property) => !allowedSystemSideEffectProperties.includes(property));

    if (forbiddenUpdatedProperties.length > 0) {
      throw new FieldMetadataException(
        `Cannot edit system-managed field "${existingFlatFieldMetadata.name}" properties: ${forbiddenUpdatedProperties.join(', ')}`,
        FieldMetadataExceptionCode.FIELD_MUTATION_NOT_ALLOWED,
      );
    }

    if (
      isSystemSideEffectDateField &&
      isDefined(updatedEditableFieldProperties.settings)
    ) {
      const mergedSettings = mergeSystemSideEffectDateFieldSettings({
        existingSettings: existingFlatFieldMetadata.settings,
        incomingSettings: updatedEditableFieldProperties.settings,
      });

      if (mergedSettings === undefined) {
        // No-op update: merged value matches the existing settings
        delete updatedEditableFieldProperties.settings;
      } else {
        updatedEditableFieldProperties.settings = mergedSettings;
      }
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

  const { overrides, remainingProperties } = computeMetadataOverridesBlob({
    overridableProperties:
      ALL_OVERRIDABLE_PROPERTIES_BY_METADATA_NAME.fieldMetadata,
    updatedProperties: updatedEditableFieldProperties,
    existingEntity: existingFlatFieldMetadata,
    existingOverrides: existingFlatFieldMetadata.overrides,
  });

  return {
    overrides: mergeTranslationsIntoOverrides({
      existingOverrides: overrides,
      translationEntries,
    }),
    updatedEditableFieldProperties: remainingProperties,
  };
};

const SYSTEM_SIDE_EFFECT_DATE_FIELD_SETTINGS_KEYS = [
  'displayFormat',
  'customUnicodeDateFormat',
] as const;

const DATE_DISPLAY_FORMAT_VALUES = new Set<string>([
  DateDisplayFormat.RELATIVE,
  DateDisplayFormat.USER_SETTINGS,
  DateDisplayFormat.CUSTOM,
]);

const isDateDisplayFormatValue = (value: unknown): value is DateDisplayFormat =>
  typeof value === 'string' && DATE_DISPLAY_FORMAT_VALUES.has(value);

const isValidCustomDateFormat = (value: unknown): value is string => {
  if (typeof value !== 'string' || value.length === 0) {
    return false;
  }

  try {
    formatDate(new Date(), value);

    return true;
  } catch {
    return false;
  }
};

const mergeSystemSideEffectDateFieldSettings = ({
  existingSettings,
  incomingSettings,
}: {
  existingSettings: FlatFieldMetadata['settings'];
  incomingSettings: unknown;
}): Record<string, unknown> | undefined => {
  const rawIncoming = (incomingSettings ?? {}) as Record<string, unknown>;

  const knownKeys = new Set<string>(
    SYSTEM_SIDE_EFFECT_DATE_FIELD_SETTINGS_KEYS,
  );

  const unknownKeys = Object.keys(rawIncoming).filter(
    (key) => !knownKeys.has(key),
  );

  if (unknownKeys.length > 0) {
    throw new FieldMetadataException(
      `Cannot edit system-managed date field settings: only ${SYSTEM_SIDE_EFFECT_DATE_FIELD_SETTINGS_KEYS.join(', ')} are allowed`,
      FieldMetadataExceptionCode.FIELD_MUTATION_NOT_ALLOWED,
    );
  }

  const existingRecord = (existingSettings ?? {}) as Record<string, unknown>;

  const merged: Record<string, unknown> = { ...existingRecord };

  if ('displayFormat' in rawIncoming) {
    const value = rawIncoming.displayFormat;

    if (!isDateDisplayFormatValue(value)) {
      throw new FieldMetadataException(
        `Invalid displayFormat for system-managed date field: expected one of ${DateDisplayFormat.RELATIVE}, ${DateDisplayFormat.USER_SETTINGS}, or ${DateDisplayFormat.CUSTOM}`,
        FieldMetadataExceptionCode.FIELD_MUTATION_NOT_ALLOWED,
      );
    }

    merged.displayFormat = value;
  }

  if ('customUnicodeDateFormat' in rawIncoming) {
    const value = rawIncoming.customUnicodeDateFormat;

    if (value === null) {
      delete merged.customUnicodeDateFormat;
    } else if (!isValidCustomDateFormat(value)) {
      throw new FieldMetadataException(
        `Invalid customUnicodeDateFormat for system-managed date field: not a valid date-fns format string`,
        FieldMetadataExceptionCode.FIELD_MUTATION_NOT_ALLOWED,
      );
    } else {
      merged.customUnicodeDateFormat = value;
    }
  }

  // Drop the no-op case: the request produced the same settings object as the current value
  if (fastDeepEqual(merged, existingRecord)) {
    return undefined;
  }

  return merged;
};
