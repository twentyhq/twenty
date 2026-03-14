import { type APP_LOCALES, SOURCE_LOCALE } from 'twenty-shared/translations';
import {
  extractAndSanitizeObjectStringFields,
  isDefined,
} from 'twenty-shared/utils';

import { FLAT_OBJECT_METADATA_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-object-metadata/constants/flat-object-metadata-editable-properties.constant';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { OBJECT_METADATA_STANDARD_OVERRIDES_PROPERTIES } from 'src/engine/metadata-modules/object-metadata/constants/object-metadata-standard-overrides-properties.constant';
import { type UpdateOneObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/update-object.input';
import {
  ObjectMetadataException,
  ObjectMetadataExceptionCode,
} from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';
import { type ObjectMetadataStandardOverridesProperties } from 'src/engine/metadata-modules/object-metadata/types/object-metadata-standard-overrides-properties.types';
import { belongsToTwentyStandardApp } from 'src/engine/metadata-modules/utils/belongs-to-twenty-standard-app.util';

type SanitizeRawUpdateObjectInputArgs = {
  rawUpdateObjectInput: UpdateOneObjectInput;
  existingFlatObjectMetadata: FlatObjectMetadata;
  locale?: keyof typeof APP_LOCALES;
};

export const sanitizeRawUpdateObjectInput = ({
  existingFlatObjectMetadata,
  rawUpdateObjectInput,
  locale,
}: SanitizeRawUpdateObjectInputArgs) => {
  const isStandardObject = belongsToTwentyStandardApp(
    existingFlatObjectMetadata,
  );
  const updatedEditableObjectProperties = extractAndSanitizeObjectStringFields(
    rawUpdateObjectInput.update,
    [
      ...new Set([
        ...FLAT_OBJECT_METADATA_EDITABLE_PROPERTIES.standard,
        ...FLAT_OBJECT_METADATA_EDITABLE_PROPERTIES.custom,
      ]),
    ],
  );

  if (!isStandardObject) {
    return {
      updatedEditableObjectProperties,
      standardOverrides: null,
    };
  }

  const invalidUpdatedProperties = Object.keys(
    updatedEditableObjectProperties,
  ).filter(
    (property) =>
      !FLAT_OBJECT_METADATA_EDITABLE_PROPERTIES.standard.includes(
        property as ObjectMetadataStandardOverridesProperties,
      ),
  );

  if (invalidUpdatedProperties.length > 0) {
    throw new ObjectMetadataException(
      `Cannot edit standard object metadata properties: ${invalidUpdatedProperties.join(', ')}`,
      ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
    );
  }

  const isSourceLocale = !locale || locale === SOURCE_LOCALE;

  const standardOverrides =
    OBJECT_METADATA_STANDARD_OVERRIDES_PROPERTIES.reduce(
      (standardOverrides, property) => {
        const propertyValue = updatedEditableObjectProperties[property];

        const isPropertyUpdated =
          updatedEditableObjectProperties[property] !== undefined;

        if (!isPropertyUpdated) {
          return standardOverrides;
        }
        delete updatedEditableObjectProperties[property];

        if (propertyValue === existingFlatObjectMetadata[property]) {
          if (isSourceLocale || property === 'icon') {
            if (
              isDefined(standardOverrides) &&
              Object.prototype.hasOwnProperty.call(standardOverrides, property)
            ) {
              const { [property]: _, ...restOverrides } = standardOverrides;

              return restOverrides;
            }

            return standardOverrides;
          }

          const localeTranslations = standardOverrides?.translations?.[locale];

          if (
            !isDefined(localeTranslations) ||
            !Object.prototype.hasOwnProperty.call(localeTranslations, property)
          ) {
            return standardOverrides;
          }

          const { [property]: _removed, ...restLocaleTranslations } =
            localeTranslations;
          const { [locale]: _locale, ...restTranslations } =
            standardOverrides?.translations ?? {};

          const updatedTranslations =
            Object.keys(restLocaleTranslations).length > 0
              ? { ...restTranslations, [locale]: restLocaleTranslations }
              : restTranslations;

          if (Object.keys(updatedTranslations).length > 0) {
            return { ...standardOverrides, translations: updatedTranslations };
          }

          const { translations: _translations, ...rootOverrides } =
            standardOverrides ?? {};

          return Object.keys(rootOverrides).length > 0
            ? (rootOverrides as NonNullable<typeof standardOverrides>)
            : null;
        }

        if (isSourceLocale || property === 'icon') {
          return {
            ...standardOverrides,
            [property]: propertyValue,
          };
        }

        const localeTranslations = standardOverrides?.translations?.[locale];
        const existingTranslationValue =
          localeTranslations?.[property as keyof typeof localeTranslations];

        if (propertyValue === existingTranslationValue) {
          return standardOverrides;
        }

        return {
          ...standardOverrides,
          translations: {
            ...standardOverrides?.translations,
            [locale]: {
              ...standardOverrides?.translations?.[locale],
              [property]: propertyValue,
            },
          },
        };
      },
      existingFlatObjectMetadata.standardOverrides,
    );

  if (
    isDefined(standardOverrides) &&
    Object.keys(standardOverrides).length === 0
  ) {
    return {
      standardOverrides: null,
      updatedEditableObjectProperties,
    };
  }

  return {
    standardOverrides,
    updatedEditableObjectProperties,
  };
};
