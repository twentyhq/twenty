import { FieldMetadataType } from 'twenty-shared/types';
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
import { isFlatFieldMetadataEntityOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
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

  if (
    isFlatFieldMetadataEntityOfType(
      flatFieldMetadataToDelete,
      FieldMetadataType.RELATION,
    )
  ) {
    const { relationTargetFieldMetadataId, relationTargetObjectMetadataId } =
      flatFieldMetadataToDelete;

    const relatedFlatObjectMetadata =
      existingFlatObjectMetadataMaps.byId[relationTargetObjectMetadataId];

    if (!isDefined(relatedFlatObjectMetadata)) {
      throw new FieldMetadataException(
        `Deleted field metadata relation object metadata target not found`,
        FieldMetadataExceptionCode.OBJECT_METADATA_NOT_FOUND,
      );
    }
    const relatedFlatFieldMetadata =
      relatedFlatObjectMetadata.fieldsById[relationTargetFieldMetadataId];

    if (!isDefined(relatedFlatFieldMetadata)) {
      throw new FieldMetadataException(
        `Deleted field metadata relation field metadata target not found`,
        FieldMetadataExceptionCode.FIELD_METADATA_NOT_FOUND,
      );
    }

    return [flatFieldMetadataToDelete, relatedFlatFieldMetadata];
  }

  if (
    isFlatFieldMetadataEntityOfType(
      flatFieldMetadataToDelete,
      FieldMetadataType.MORPH_RELATION,
    )
  ) {
    // TODO prastoin
    return [flatFieldMetadataToDelete];
  }

  return [flatFieldMetadataToDelete];
};
