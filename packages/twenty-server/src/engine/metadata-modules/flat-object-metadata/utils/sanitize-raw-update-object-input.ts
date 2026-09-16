import { extractAndSanitizeObjectStringFields } from 'twenty-shared/utils';

import { FLAT_OBJECT_METADATA_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-object-metadata/constants/flat-object-metadata-editable-properties.constant';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type UpdateOneObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/update-object.input';
import {
  ObjectMetadataException,
  ObjectMetadataExceptionCode,
} from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';
import { belongsToTwentyStandardApp } from 'src/engine/metadata-modules/utils/belongs-to-twenty-standard-app.util';
import { dispatchUpdateToAuthoredOverride } from 'src/engine/metadata-modules/overrides/utils/dispatch-update-to-authored-override.util';
import { findInvalidTranslationOverrideProperties } from 'src/engine/metadata-modules/overrides/utils/find-invalid-translation-override-properties.util';
import { mergeTranslationsIntoOverrides } from 'src/engine/metadata-modules/overrides/utils/merge-translations-into-overrides.util';

type SanitizeRawUpdateObjectInputArgs = {
  rawUpdateObjectInput: UpdateOneObjectInput;
  existingFlatObjectMetadata: FlatObjectMetadata;
  workspaceCustomApplicationUniversalIdentifier: string;
};

export const sanitizeRawUpdateObjectInput = ({
  existingFlatObjectMetadata,
  rawUpdateObjectInput,
  workspaceCustomApplicationUniversalIdentifier,
}: SanitizeRawUpdateObjectInputArgs) => {
  const authorContext = {
    workspaceCustomApplicationUniversalIdentifier,
    ownerApplicationUniversalIdentifier:
      existingFlatObjectMetadata.applicationUniversalIdentifier,
  };
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
  const translationEntries = rawUpdateObjectInput.update.translations ?? [];
  const invalidTranslationProperties = findInvalidTranslationOverrideProperties(
    translationEntries,
    'objectMetadata',
  );

  if (invalidTranslationProperties.length > 0) {
    throw new ObjectMetadataException(
      `Cannot translate object metadata properties: ${invalidTranslationProperties.join(', ')}`,
      ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
    );
  }

  if (!isStandardObject) {
    return {
      updatedEditableObjectProperties,
      overrides: mergeTranslationsIntoOverrides({
        metadataName: 'objectMetadata',
        existingOverrides: existingFlatObjectMetadata.overrides,
        translationEntries,
        authorUniversalIdentifier:
          workspaceCustomApplicationUniversalIdentifier,
        authorContext,
      }),
    };
  }

  const invalidUpdatedProperties = Object.keys(
    updatedEditableObjectProperties,
  ).filter(
    (property) =>
      !FLAT_OBJECT_METADATA_EDITABLE_PROPERTIES.standard.includes(
        property as (typeof FLAT_OBJECT_METADATA_EDITABLE_PROPERTIES.standard)[number],
      ),
  );

  if (invalidUpdatedProperties.length > 0) {
    throw new ObjectMetadataException(
      `Cannot edit standard object metadata properties: ${invalidUpdatedProperties.join(', ')}`,
      ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
    );
  }

  const { overrides, columnProperties } = dispatchUpdateToAuthoredOverride({
    metadataName: 'objectMetadata',
    updatedProperties: updatedEditableObjectProperties,
    existingEntity: existingFlatObjectMetadata,
    existingOverrides: existingFlatObjectMetadata.overrides,
    authorUniversalIdentifier: workspaceCustomApplicationUniversalIdentifier,
    authorContext,
  });

  return {
    overrides: mergeTranslationsIntoOverrides({
      metadataName: 'objectMetadata',
      existingOverrides: overrides,
      translationEntries,
      authorUniversalIdentifier: workspaceCustomApplicationUniversalIdentifier,
      authorContext,
    }),
    updatedEditableObjectProperties: columnProperties,
  };
};
