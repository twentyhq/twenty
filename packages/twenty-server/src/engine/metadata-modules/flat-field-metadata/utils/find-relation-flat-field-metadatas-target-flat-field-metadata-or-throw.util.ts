import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { type MorphOrRelationFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/types/morph-or-relation-field-metadata-type.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isFlatFieldMetadataEntityOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { type FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';

export type GetRelationFlatFieldMetadatasUtilArgs = {
  flatObjectMetadataMaps: FlatObjectMetadataMaps;
  flatFieldMetadata: FlatFieldMetadata<MorphOrRelationFieldMetadataType>;
};

export const findRelationFlatFieldMetadataTargetFlatFieldMetadataOrThrow = ({
  flatObjectMetadataMaps,
  flatFieldMetadata,
}: GetRelationFlatFieldMetadatasUtilArgs): FlatFieldMetadata<FieldMetadataType.RELATION> => {
  const { relationTargetFieldMetadataId, relationTargetObjectMetadataId } =
    flatFieldMetadata;

  const relatedFlatObjectMetadata =
    flatObjectMetadataMaps.byId[relationTargetObjectMetadataId];

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

  if (
    !isFlatFieldMetadataEntityOfType(
      relatedFlatFieldMetadata,
      FieldMetadataType.RELATION,
    )
  ) {
    throw new FieldMetadataException(
      `Relation target field metadata is not a relation field metadata`,
      FieldMetadataExceptionCode.FIELD_METADATA_RELATION_MALFORMED,
    );
  }

  return relatedFlatFieldMetadata;
};
