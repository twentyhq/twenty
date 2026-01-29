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
import { removeStandardOverride } from 'src/engine/metadata-modules/object-metadata/utils/remove-standard-override.util';
import { setStandardOverrideForLocale } from 'src/engine/metadata-modules/object-metadata/utils/set-standard-override-for-locale.util';
import { isStandardMetadata } from 'src/engine/metadata-modules/utils/is-standard-metadata.util';

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
  const isStandardObject = isStandardMetadata(existingFlatObjectMetadata);
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

  const safeLocale = locale ?? SOURCE_LOCALE;

  let standardOverrides = existingFlatObjectMetadata.standardOverrides;

  for (const property of OBJECT_METADATA_STANDARD_OVERRIDES_PROPERTIES) {
    const propertyValue = updatedEditableObjectProperties[property];
    const isPropertyUpdated = propertyValue !== undefined;

    if (!isPropertyUpdated) {
      continue;
    }

    delete updatedEditableObjectProperties[property];

    const isResettingToDefault =
      propertyValue === existingFlatObjectMetadata[property];

    if (isResettingToDefault) {
      standardOverrides = removeStandardOverride({
        overrides: standardOverrides,
        property,
      });
    } else {
      standardOverrides = setStandardOverrideForLocale({
        overrides: standardOverrides,
        property,
        value: propertyValue,
        locale: safeLocale,
      });
    }
  }

  const isEmptyOverrides =
    isDefined(standardOverrides) && Object.keys(standardOverrides).length === 0;

  return {
    standardOverrides: isEmptyOverrides ? null : standardOverrides,
    updatedEditableObjectProperties,
  };
};
