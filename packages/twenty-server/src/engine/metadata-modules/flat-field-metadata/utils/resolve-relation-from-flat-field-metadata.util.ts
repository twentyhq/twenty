import { FieldMetadataType } from 'twenty-shared/types';

import { findMorphRelationGroupOrThrow } from 'src/engine/metadata-modules/flat-field-metadata/utils/find-morph-relation-group-or-throw.util';
import { RelationDTO } from 'src/engine/metadata-modules/field-metadata/dtos/relation.dto';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { fromMorphOrRelationFlatFieldMetadataToRelationDto } from 'src/engine/metadata-modules/flat-field-metadata/utils/from-morph-or-relation-flat-field-metadata-to-relation-dto.util';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

type ResolveRelationFromFlatFieldMetadataArgs = {
  sourceFlatFieldMetadata: FlatFieldMetadata<FieldMetadataType.RELATION>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
};

export const resolveRelationFromFlatFieldMetadata = ({
  sourceFlatFieldMetadata,
  flatFieldMetadataMaps,
  flatObjectMetadataMaps,
}: ResolveRelationFromFlatFieldMetadataArgs): RelationDTO | null => {
  const sourceFlatObjectMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
    flatEntityId: sourceFlatFieldMetadata.objectMetadataId,
    flatEntityMaps: flatObjectMetadataMaps,
  });

  const targetFlatFieldMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
    flatEntityId: sourceFlatFieldMetadata.relationTargetFieldMetadataId,
    flatEntityMaps: flatFieldMetadataMaps,
  });

  if (!isMorphOrRelationFlatFieldMetadata(targetFlatFieldMetadata)) {
    return null;
  }

  const targetFlatObjectMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
    flatEntityId: targetFlatFieldMetadata.objectMetadataId,
    flatEntityMaps: flatObjectMetadataMaps,
  });

  if (
    isFlatFieldMetadataOfType(
      targetFlatFieldMetadata,
      FieldMetadataType.MORPH_RELATION,
    )
  ) {
    return fromMorphOrRelationFlatFieldMetadataToRelationDto({
      sourceFlatFieldMetadata,
      sourceFlatObjectMetadata,
      targetFlatFieldMetadata: findMorphRelationGroupOrThrow({
        morphFieldMetadata: targetFlatFieldMetadata,
        flatFieldMetadataMaps,
      }),
      targetFlatObjectMetadata,
    });
  }

  return fromMorphOrRelationFlatFieldMetadataToRelationDto({
    sourceFlatFieldMetadata,
    targetFlatFieldMetadata,
    targetFlatObjectMetadata,
    sourceFlatObjectMetadata,
  });
};
