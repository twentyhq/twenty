import {
  isDefined,
  trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties,
} from 'twenty-shared/utils';

import { type DeleteOneFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/delete-field.input';
import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { computeFlatFieldMetadataRelatedFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/compute-flat-field-metadata-related-flat-field-metadata.util';
import { type FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { findFlatFieldMetadataInFlatObjectMetadataMapsWithOnlyFieldId } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/find-flat-field-metadata-in-flat-object-metadata-maps-with-field-id-only.util';

type FromDeleteFieldInputToFlatFieldMetadatasToDeleteArgs = {
  existingFlatObjectMetadataMaps: FlatObjectMetadataMaps;
  deleteOneFieldInput: DeleteOneFieldInput;
};
export const fromDeleteFieldInputToFlatFieldMetadatasToDelete = ({
  existingFlatObjectMetadataMaps,
  deleteOneFieldInput: rawDeleteOneInput,
}: FromDeleteFieldInputToFlatFieldMetadatasToDeleteArgs): FlatFieldMetadata[] => {
  const { id: fieldMetadataToDeleteId } =
    trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(
      rawDeleteOneInput,
      ['id'],
    );

  const flatFieldMetadataToDelete =
    findFlatFieldMetadataInFlatObjectMetadataMapsWithOnlyFieldId({
      fieldMetadataId: fieldMetadataToDeleteId,
      flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
    });

  if (!isDefined(flatFieldMetadataToDelete)) {
    throw new FieldMetadataException(
      'Field to delete not found',
      FieldMetadataExceptionCode.FIELD_METADATA_NOT_FOUND,
    );
  }

  const relatedFlatFieldMetadataToDelete =
    computeFlatFieldMetadataRelatedFlatFieldMetadata({
      flatFieldMetadata: flatFieldMetadataToDelete,
      flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
    });

  return [flatFieldMetadataToDelete, ...relatedFlatFieldMetadataToDelete];
};
