import { FieldMetadataType } from 'twenty-shared/types';
import { isMorphRelationGroup } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';

export const findMorphRelationGroupOrThrow = ({
  morphFieldMetadata,
  flatFieldMetadataMaps,
}: {
  morphFieldMetadata: FlatFieldMetadata<FieldMetadataType.MORPH_RELATION>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): FlatFieldMetadata<FieldMetadataType.MORPH_RELATION> => {
  const group = findFlatEntityByUniversalIdentifierOrThrow({
    universalIdentifier: morphFieldMetadata.morphId,
    flatEntityMaps: flatFieldMetadataMaps,
  });

  if (
    !isFlatFieldMetadataOfType(group, FieldMetadataType.MORPH_RELATION) ||
    !isMorphRelationGroup(group) ||
    group.objectMetadataId !== morphFieldMetadata.objectMetadataId
  ) {
    throw new FieldMetadataException(
      'Morph relation group not found',
      FieldMetadataExceptionCode.FIELD_METADATA_NOT_FOUND,
    );
  }

  return group;
};
