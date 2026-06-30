import { FieldMetadataType } from 'twenty-shared/types';

import { RelationDTO } from 'src/engine/metadata-modules/field-metadata/dtos/relation.dto';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { findAllOthersMorphRelationFlatFieldMetadatasOrThrow } from 'src/engine/metadata-modules/flat-field-metadata/utils/find-all-others-morph-relation-flat-field-metadatas-or-throw.util';
import { fromMorphOrRelationFlatFieldMetadataToRelationDto } from 'src/engine/metadata-modules/flat-field-metadata/utils/from-morph-or-relation-flat-field-metadata-to-relation-dto.util';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { getMorphNameFromMorphFieldMetadataName } from 'src/engine/metadata-modules/flat-object-metadata/utils/get-morph-name-from-morph-field-metadata-name.util';

type ResolveMorphRelationsFromFlatFieldMetadataArgs = {
  morphFlatFieldMetadata: FlatFieldMetadata<FieldMetadataType.MORPH_RELATION>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
};

export const resolveMorphRelationsFromFlatFieldMetadata = ({
  morphFlatFieldMetadata,
  flatFieldMetadataMaps,
  flatObjectMetadataMaps,
}: ResolveMorphRelationsFromFlatFieldMetadataArgs): RelationDTO[] => {
  const sourceFlatObjectMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
    flatEntityMaps: flatObjectMetadataMaps,
    flatEntityId: morphFlatFieldMetadata.objectMetadataId,
  });

  const relatedMorphFlatFieldMetadatas =
    findAllOthersMorphRelationFlatFieldMetadatasOrThrow({
      flatFieldMetadata: morphFlatFieldMetadata,
      flatFieldMetadataMaps,
      flatObjectMetadata: sourceFlatObjectMetadata,
    });

  const allMorphFlatFieldMetadatas = [
    morphFlatFieldMetadata,
    ...relatedMorphFlatFieldMetadatas,
  ];

  return allMorphFlatFieldMetadatas.flatMap((sourceFlatFieldMetadata) => {
    const targetFlatFieldMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: sourceFlatFieldMetadata.relationTargetFieldMetadataId,
      flatEntityMaps: flatFieldMetadataMaps,
    });

    if (!isMorphOrRelationFlatFieldMetadata(targetFlatFieldMetadata)) {
      return [];
    }

    const targetFlatObjectMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: sourceFlatFieldMetadata.relationTargetObjectMetadataId,
      flatEntityMaps: flatObjectMetadataMaps,
    });

    const morphNameFromMorphFieldMetadataName =
      getMorphNameFromMorphFieldMetadataName({
        morphRelationFlatFieldMetadata: sourceFlatFieldMetadata,
        nameSingular: targetFlatObjectMetadata.nameSingular,
        namePlural: targetFlatObjectMetadata.namePlural,
      });

    return fromMorphOrRelationFlatFieldMetadataToRelationDto({
      sourceFlatFieldMetadata: {
        ...sourceFlatFieldMetadata,
        name: morphNameFromMorphFieldMetadataName,
      },
      targetFlatFieldMetadata,
      targetFlatObjectMetadata,
      sourceFlatObjectMetadata,
    });
  });
};
