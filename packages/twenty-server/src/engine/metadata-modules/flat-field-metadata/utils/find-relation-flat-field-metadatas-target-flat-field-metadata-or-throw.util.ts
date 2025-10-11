import { isDefined } from 'twenty-shared/utils';

import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { type MorphOrRelationFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/types/morph-or-relation-field-metadata-type.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';

export type GetRelationFlatFieldMetadatasUtilArgs = {
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  flatFieldMetadata: FlatFieldMetadata<MorphOrRelationFieldMetadataType>;
};

export const findRelationFlatFieldMetadataTargetFlatFieldMetadataOrThrow = ({
  flatFieldMetadataMaps,
  flatFieldMetadata,
}: GetRelationFlatFieldMetadatasUtilArgs): FlatFieldMetadata<MorphOrRelationFieldMetadataType> => {
  const { relationTargetFieldMetadataId } = flatFieldMetadata;

  const relatedFlatFieldMetadata =
    flatFieldMetadataMaps.byId[relationTargetFieldMetadataId];

  if (!isDefined(relatedFlatFieldMetadata)) {
    throw new FieldMetadataException(
      `Deleted field metadata relation field metadata target not found`,
      FieldMetadataExceptionCode.FIELD_METADATA_NOT_FOUND,
    );
  }

  if (!isMorphOrRelationFlatFieldMetadata(relatedFlatFieldMetadata)) {
    throw new FieldMetadataException(
      `Relation target field metadata is not a relation or morph relation field metadata`,
      FieldMetadataExceptionCode.FIELD_METADATA_RELATION_MALFORMED,
    );
  }

  return relatedFlatFieldMetadata;
};
