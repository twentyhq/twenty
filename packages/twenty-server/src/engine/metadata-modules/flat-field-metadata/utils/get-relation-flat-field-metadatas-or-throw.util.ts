import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

type FromDeleteFieldInputToFlatFieldMetadatasToDeleteUtilArgs = {
  existingFlatObjectMetadataMaps: FlatObjectMetadataMaps;
  flatFieldMetadata: FlatFieldMetadata<
    FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION
  >;
};
// TODO prastoin handle morph relation
export const getRelationFlatFieldMetadatasOrThrow = ({
  existingFlatObjectMetadataMaps,
  flatFieldMetadata,
}: FromDeleteFieldInputToFlatFieldMetadatasToDeleteUtilArgs): FlatFieldMetadata[] => {
  const { relationTargetFieldMetadataId, relationTargetObjectMetadataId } =
    flatFieldMetadata;

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

  return [flatFieldMetadata, relatedFlatFieldMetadata];
};
