import { t } from '@lingui/core/macro';
import {
  extractAndSanitizeObjectStringFields,
  isDefined,
} from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type AllFlatEntityMaps } from 'src/engine/core-modules/common/types/all-flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/core-modules/common/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { FIELD_METADATA_STANDARD_OVERRIDES_PROPERTIES } from 'src/engine/metadata-modules/field-metadata/constants/field-metadata-standard-overrides-properties.constant';
import { type UpdateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/update-field.input';
import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { type FieldMetadataStandardOverridesProperties } from 'src/engine/metadata-modules/field-metadata/types/field-metadata-standard-overrides-properties.type';
import { FLAT_FIELD_METADATA_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-field-metadata/constants/flat-field-metadata-editable-properties.constant';
import { type FieldInputTranspilationResult } from 'src/engine/metadata-modules/flat-field-metadata/types/field-input-transpilation-result.type';
import { type FlatFieldMetadataEditableProperties } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-editable-properties.constant';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { computeFlatFieldMetadataRelatedFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/compute-flat-field-metadata-related-flat-field-metadata.util';
import { recomputeIndexOnFlatFieldMetadataNameUpdate } from 'src/engine/metadata-modules/flat-field-metadata/utils/recompute-index-on-flat-field-metadata-name-update.util';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { isStandardMetadata } from 'src/engine/metadata-modules/utils/is-standard-metadata.util';

type UpdatedFlatFieldMetadataAndIndexToUpdate = {
  flatFieldMetadata: FlatFieldMetadata;
  flatIndexMetadataToUpdate: FlatIndexMetadata[];
};

type SanitizedUpdateFieldInput = ReturnType<
  typeof extractAndSanitizeObjectStringFields<
    UpdateFieldInput,
    FlatFieldMetadataEditableProperties[]
  >
>;

type ApplyUpdatesToFlatFieldMetadataArgs = {
  updatedEditableFieldProperties: SanitizedUpdateFieldInput;
  fromFlatFieldMetadata: FlatFieldMetadata;
} & Pick<
  AllFlatEntityMaps,
  'flatIndexMaps' | 'flatObjectMetadataMaps' | 'flatFieldMetadataMaps'
>;

const applyUpdatesToFlatFieldMetadata = ({
  updatedEditableFieldProperties,
  fromFlatFieldMetadata,
  flatObjectMetadataMaps,
  flatIndexMaps,
  flatFieldMetadataMaps,
}: ApplyUpdatesToFlatFieldMetadataArgs) => {
  return FLAT_FIELD_METADATA_EDITABLE_PROPERTIES.reduce<UpdatedFlatFieldMetadataAndIndexToUpdate>(
    ({ flatFieldMetadata, flatIndexMetadataToUpdate }, property) => {
      const updatedPropertyValue = updatedEditableFieldProperties[property];
      const isPropertyUpdated =
        updatedPropertyValue !== undefined &&
        flatFieldMetadata[property] !== updatedPropertyValue;

      if (!isPropertyUpdated) {
        return {
          flatFieldMetadata,
          flatIndexMetadataToUpdate,
        };
      }
      const updatedFlatFieldMetadata = {
        ...flatFieldMetadata,
        [property]: updatedPropertyValue,
      };

      if (property === 'options') {
        updatedFlatFieldMetadata.options =
          updatedEditableFieldProperties[property]?.map((option) => ({
            id: v4(),
            ...option,
          })) ?? [];
      }

      let newFlatIndexMetadataToUpdate: FlatIndexMetadata[] = [];

      if (property === 'name') {
        const flatObjectMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
          flatEntityMaps: flatObjectMetadataMaps,
          flatEntityId: flatFieldMetadata.objectMetadataId,
        });

        newFlatIndexMetadataToUpdate =
          recomputeIndexOnFlatFieldMetadataNameUpdate({
            flatFieldMetadataMaps,
            flatObjectMetadata,
            fromFlatFieldMetadata,
            toFlatFieldMetadata: {
              name: updatedFlatFieldMetadata.name,
            },
            flatIndexMaps,
          });
      }

      return {
        flatFieldMetadata: updatedFlatFieldMetadata,
        flatIndexMetadataToUpdate: [
          ...flatIndexMetadataToUpdate,
          ...newFlatIndexMetadataToUpdate,
        ],
      };
    },
    {
      flatFieldMetadata: structuredClone(fromFlatFieldMetadata),
      flatIndexMetadataToUpdate: [],
    },
  );
};

type FromUpdateFieldInputToFlatFieldMetadataArgs = {
  updateFieldInput: UpdateFieldInput;
} & Pick<
  AllFlatEntityMaps,
  'flatObjectMetadataMaps' | 'flatIndexMaps' | 'flatFieldMetadataMaps'
>;

type FlatFieldMetadataAndIndexToUpdate = {
  flatFieldMetadatasToUpdate: FlatFieldMetadata[];
  flatIndexMetadatasToUpdate: FlatIndexMetadata[];
};
export const fromUpdateFieldInputToFlatFieldMetadata = ({
  flatIndexMaps,
  flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
  flatFieldMetadataMaps,
  updateFieldInput: rawUpdateFieldInput,
}: FromUpdateFieldInputToFlatFieldMetadataArgs): FieldInputTranspilationResult<FlatFieldMetadataAndIndexToUpdate> => {
  const updateFieldInputInformalProperties =
    extractAndSanitizeObjectStringFields(rawUpdateFieldInput, [
      'objectMetadataId',
      'id',
    ]);
  const updatedEditableFieldProperties = extractAndSanitizeObjectStringFields(
    rawUpdateFieldInput,
    FLAT_FIELD_METADATA_EDITABLE_PROPERTIES,
  );

  const existingFlatFieldMetadataToUpdate = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: updateFieldInputInformalProperties.id,
    flatEntityMaps: flatFieldMetadataMaps,
  });

  if (!isDefined(existingFlatFieldMetadataToUpdate)) {
    return {
      status: 'fail',
      error: {
        code: FieldMetadataExceptionCode.FIELD_METADATA_NOT_FOUND,
        message: 'Field metadata to update not found',
        userFriendlyMessage: t`Field metadata to update not found`,
      },
    };
  }

  if (isStandardMetadata(existingFlatFieldMetadataToUpdate)) {
    const invalidUpdatedProperties = Object.keys(
      updatedEditableFieldProperties,
    ).filter((property) =>
      FIELD_METADATA_STANDARD_OVERRIDES_PROPERTIES.includes(
        property as FieldMetadataStandardOverridesProperties,
      ),
    );

    if (invalidUpdatedProperties.length > 0) {
      const invalidProperties = invalidUpdatedProperties.join(', ');

      return {
        status: 'fail',
        error: {
          code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
          message: `Cannot update standard field metadata properties: ${invalidProperties}`,
          userFriendlyMessage: t`Cannot update standard field properties: ${invalidProperties}`,
        },
      };
    }

    const updatedStandardFlatFieldMetadata =
      FIELD_METADATA_STANDARD_OVERRIDES_PROPERTIES.reduce((acc, property) => {
        const isPropertyUpdated =
          updatedEditableFieldProperties[property] !== undefined;

        return {
          ...acc,
          standardOverrides: {
            ...acc.standardOverrides,
            ...(isPropertyUpdated
              ? { [property]: updatedEditableFieldProperties[property] }
              : {}),
          },
        };
      }, existingFlatFieldMetadataToUpdate);

    return {
      status: 'success',
      result: {
        flatFieldMetadatasToUpdate: [updatedStandardFlatFieldMetadata],
        flatIndexMetadatasToUpdate: [],
      },
    };
  }

  const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: existingFlatFieldMetadataToUpdate.objectMetadataId,
    flatEntityMaps: existingFlatObjectMetadataMaps,
  });

  if (!isDefined(flatObjectMetadata)) {
    throw new FieldMetadataException(
      'Field to update object metadata not found',
      FieldMetadataExceptionCode.OBJECT_METADATA_NOT_FOUND,
    );
  }

  const relatedFlatFieldMetadatasToUpdate =
    computeFlatFieldMetadataRelatedFlatFieldMetadata({
      flatFieldMetadata: existingFlatFieldMetadataToUpdate,
      flatFieldMetadataMaps,
      flatObjectMetadata,
    });

  const flatFieldMetadatasToUpdate = [
    existingFlatFieldMetadataToUpdate,
    ...relatedFlatFieldMetadatasToUpdate,
  ];

  const optimisticiallyUpdatedFlatFieldMetadatas =
    flatFieldMetadatasToUpdate.reduce<FlatFieldMetadataAndIndexToUpdate>(
      (acc, fromFlatFieldMetadata) => {
        const { flatFieldMetadata, flatIndexMetadataToUpdate } =
          applyUpdatesToFlatFieldMetadata({
            flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
            fromFlatFieldMetadata,
            flatFieldMetadataMaps,
            flatIndexMaps,
            updatedEditableFieldProperties,
          });

        return {
          flatFieldMetadatasToUpdate: [
            ...acc.flatFieldMetadatasToUpdate,
            flatFieldMetadata,
          ],
          flatIndexMetadatasToUpdate: [
            ...acc.flatIndexMetadatasToUpdate,
            ...flatIndexMetadataToUpdate,
          ],
        };
      },
      {
        flatFieldMetadatasToUpdate: [],
        flatIndexMetadatasToUpdate: [],
      },
    );

  return {
    status: 'success',
    result: optimisticiallyUpdatedFlatFieldMetadatas,
  };
};
