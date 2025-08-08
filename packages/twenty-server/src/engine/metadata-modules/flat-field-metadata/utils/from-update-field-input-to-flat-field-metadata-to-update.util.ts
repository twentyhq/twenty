import { UpdateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/update-field.input';
import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { FieldInputTranspilationResult } from 'src/engine/metadata-modules/flat-field-metadata/types/field-input-transpilation-result.type';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { findFlatFieldMetadataInFlatObjectMetadataMapsWithOnlyFieldId } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/find-flat-field-metadata-in-flat-object-metadata-maps-with-field-id-only.util';
import {
  ObjectMetadataException,
  ObjectMetadataExceptionCode,
} from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';
import {
  extractAndSanitizeObjectStringFields,
  isDefined,
  trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties,
} from 'twenty-shared/utils';

type FromUpdateFieldInputToFlatFieldMetadataToUpdateArgs = {
  existingFlatObjectMetadataMaps: FlatObjectMetadataMaps;
  updateFieldInput: UpdateFieldInput;
};
export const fromUpdateFieldInputToFlatFieldMetadataToUpdate = ({
  existingFlatObjectMetadataMaps,
  updateFieldInput: rawUdpateFieldInput,
}: FromUpdateFieldInputToFlatFieldMetadataToUpdateArgs): FieldInputTranspilationResult<FlatFieldMetadata> => {
  const updateFieldInputInformalProperties =
    trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(
      rawUdpateFieldInput,
      ['objectMetadataId', 'id'],
    );
  const editableFieldProperties =
    extractAndSanitizeObjectStringFields(
      rawUdpateFieldInput,
      // Could it be flatFieldMetadataPropertiesToCompare ??
      ['description', 'icon', 'label', 'name'], // TODO double check list
    );

  const relatedFlatFieldMetadata =
    findFlatFieldMetadataInFlatObjectMetadataMapsWithOnlyFieldId({
      fieldMetadataId: updateFieldInputInformalProperties.id,
      flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
    });

  if (!isDefined(relatedFlatFieldMetadata)) {
    return {
      status: 'fail',
      error: new FieldMetadataException(
        'Field metadata to update not found',
        FieldMetadataExceptionCode.FIELD_METADATA_NOT_FOUND,
      ),
    };
  }

  const FlatObjectMetadataWithFlatFieldMaps =
    existingFlatObjectMetadataMaps.byId[
      relatedFlatFieldMetadata.objectMetadataId
    ];

  if (!isDefined(FlatObjectMetadataWithFlatFieldMaps)) {
    return {
      status: 'fail',
      error: new FieldMetadataException(
        'Field metadata to update object metadata not found',
        FieldMetadataExceptionCode.FIELD_METADATA_NOT_FOUND,
      ),
    };
  }

  if (FlatObjectMetadataWithFlatFieldMaps.isRemote) {
    return {
      status: 'fail',
      error: new ObjectMetadataException(
        'Remote objects are read-only',
        ObjectMetadataExceptionCode.OBJECT_MUTATION_NOT_ALLOWED,
      ),
    };
  }

  return {
    status: 'success',
    result: relatedFlatFieldMetadata,
  };
};
