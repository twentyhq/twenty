import { t } from '@lingui/core/macro';
import {
  extractAndSanitizeObjectStringFields,
  isDefined,
} from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { AllFlatEntityMaps } from 'src/engine/core-modules/common/types/all-flat-entity-maps.type';
import { FIELD_METADATA_STANDARD_OVERRIDES_PROPERTIES } from 'src/engine/metadata-modules/field-metadata/constants/field-metadata-standard-overrides-properties.constant';
import { type UpdateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/update-field.input';
import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { type FieldMetadataStandardOverridesProperties } from 'src/engine/metadata-modules/field-metadata/types/field-metadata-standard-overrides-properties.type';
import { FLAT_FIELD_METADATA_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-field-metadata/constants/flat-field-metadata-editable-properties.constant';
import { type FieldInputTranspilationResult } from 'src/engine/metadata-modules/flat-field-metadata/types/field-input-transpilation-result.type';
import { FlatFieldMetadataEditableProperties } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-editable-properties.constant';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { computeFlatFieldMetadataRelatedFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/compute-flat-field-metadata-related-flat-field-metadata.util';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { recomputeIndexOnFlatFieldMetadataNameUpdate } from 'src/engine/metadata-modules/flat-field-metadata/utils/recompute-index-on-flat-field-metadata-name-update.util';
import { FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { findFlatFieldMetadataInFlatObjectMetadataMapsWithOnlyFieldId } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/find-flat-field-metadata-in-flat-object-metadata-maps-with-field-id-only.util';
import { findFlatObjectMetadataInFlatObjectMetadataMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/find-flat-object-metadata-in-flat-object-metadata-maps-or-throw.util';
import { fromFlatObjectMetadataWithFlatFieldMapsToFlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/utils/from-flat-object-metadata-with-flat-field-maps-to-flat-object-metadatas.util';
import { isStandardMetadata } from 'src/engine/metadata-modules/utils/is-standard-metadata.util';
import { FieldMetadataType } from 'twenty-shared/types';

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
} & Pick<AllFlatEntityMaps, 'flatIndexMaps' | 'flatObjectMetadataMaps'>;

const applyUpdatesToFlatFieldMetadata = ({
  updatedEditableFieldProperties,
  fromFlatFieldMetadata,
  flatObjectMetadataMaps,
  flatIndexMaps,
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
        const flatObjectMetadata =
          findFlatObjectMetadataInFlatObjectMetadataMapsOrThrow({
            flatObjectMetadataMaps,
            objectMetadataId: flatFieldMetadata.objectMetadataId,
          });
        newFlatIndexMetadataToUpdate =
          recomputeIndexOnFlatFieldMetadataNameUpdate({
            flatObjectMetadata,
            fromFlatFieldMetadata,
            toFlatFieldMetadata: {
              name: updatedFlatFieldMetadata.name,
              isUnique: updatedEditableFieldProperties.isUnique,
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
} & Pick<AllFlatEntityMaps, 'flatObjectMetadataMaps' | 'flatIndexMaps'>;
type FlatFieldMetadataAndIndexToUdpate = {
  flatFieldMetadatasToUpdate: FlatFieldMetadata[];
  flatIndexMetadatasToUpdate: FlatIndexMetadata[];
};
export const fromUpdateFieldInputToFlatFieldMetadata = ({
  flatIndexMaps,
  flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
  updateFieldInput: rawUpdateFieldInput,
}: FromUpdateFieldInputToFlatFieldMetadataArgs): FieldInputTranspilationResult<FlatFieldMetadataAndIndexToUdpate> => {
  const updateFieldInputInformalProperties =
    extractAndSanitizeObjectStringFields(rawUpdateFieldInput, [
      'objectMetadataId',
      'id',
    ]);
  const updatedEditableFieldProperties = extractAndSanitizeObjectStringFields(
    rawUpdateFieldInput,
    FLAT_FIELD_METADATA_EDITABLE_PROPERTIES,
  );

  const existingFlatFieldMetadataToUpdate =
    findFlatFieldMetadataInFlatObjectMetadataMapsWithOnlyFieldId({
      fieldMetadataId: updateFieldInputInformalProperties.id,
      flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
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

  const flatObjectMetadataWithFlatFieldMaps =
    existingFlatObjectMetadataMaps.byId[
      existingFlatFieldMetadataToUpdate.objectMetadataId
    ];

  if (!isDefined(flatObjectMetadataWithFlatFieldMaps)) {
    return {
      status: 'fail',
      error: {
        code: FieldMetadataExceptionCode.FIELD_METADATA_NOT_FOUND,
        message: 'Field metadata to update object metadata not found',
        userFriendlyMessage: t`Field metadata to update object metadata not found`,
      },
    };
  }

  const flatObjectMetadata =
    fromFlatObjectMetadataWithFlatFieldMapsToFlatObjectMetadata(
      flatObjectMetadataWithFlatFieldMaps,
    );

  if (flatObjectMetadata.isRemote) {
    return {
      status: 'fail',
      error: {
        code: FieldMetadataExceptionCode.FIELD_MUTATION_NOT_ALLOWED,
        message: 'Remote objects are read-only',
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

  const relatedFlatFieldMetadatasToUpdate = isFlatFieldMetadataOfType(
    existingFlatFieldMetadataToUpdate,
    FieldMetadataType.MORPH_RELATION,
  )
    ? computeFlatFieldMetadataRelatedFlatFieldMetadata({
        flatFieldMetadata: existingFlatFieldMetadataToUpdate,
        flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
      })
    : [];

  const flatFieldMetadatasToUpdate = [
    existingFlatFieldMetadataToUpdate,
    ...relatedFlatFieldMetadatasToUpdate,
  ];

  const optimisticiallyUpdatedFlatFieldMetadatas =
    flatFieldMetadatasToUpdate.reduce<FlatFieldMetadataAndIndexToUdpate>(
      (acc, fromFlatFieldMetadata) => {
        const { flatFieldMetadata, flatIndexMetadataToUpdate } =
          applyUpdatesToFlatFieldMetadata({
            flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
            fromFlatFieldMetadata,
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
