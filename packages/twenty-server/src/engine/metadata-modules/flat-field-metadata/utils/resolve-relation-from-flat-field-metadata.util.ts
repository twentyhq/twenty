import { FieldMetadataType } from 'twenty-shared/types';

import { pickMorphGroupSurvivor } from 'src/engine/dataloaders/utils/pick-morph-group-survivor.util';
import { RelationDTO } from 'src/engine/metadata-modules/field-metadata/dtos/relation.dto';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { findAllOthersMorphRelationFlatFieldMetadatasOrThrow } from 'src/engine/metadata-modules/flat-field-metadata/utils/find-all-others-morph-relation-flat-field-metadatas-or-throw.util';
import { fromMorphOrRelationFlatFieldMetadataToRelationDto } from 'src/engine/metadata-modules/flat-field-metadata/utils/from-morph-or-relation-flat-field-metadata-to-relation-dto.util';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { getMorphNameFromMorphFieldMetadataName } from 'src/engine/metadata-modules/flat-object-metadata/utils/get-morph-name-from-morph-field-metadata-name.util';

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
    const morphNameFromMorphFieldMetadataName =
      getMorphNameFromMorphFieldMetadataName({
        morphRelationFlatFieldMetadata: targetFlatFieldMetadata,
        nameSingular: sourceFlatObjectMetadata.nameSingular,
        namePlural: sourceFlatObjectMetadata.namePlural,
      });

    const allMorphFlatFieldMetadatas = [
      targetFlatFieldMetadata,
      ...findAllOthersMorphRelationFlatFieldMetadatasOrThrow({
        flatFieldMetadata: targetFlatFieldMetadata,
        flatFieldMetadataMaps,
        flatObjectMetadata: targetFlatObjectMetadata,
      }),
    ];

    const survivorMorphField = pickMorphGroupSurvivor(
      allMorphFlatFieldMetadatas,
    );

    return fromMorphOrRelationFlatFieldMetadataToRelationDto({
      sourceFlatFieldMetadata,
      sourceFlatObjectMetadata,
      targetFlatFieldMetadata: {
        ...survivorMorphField,
        name: morphNameFromMorphFieldMetadataName,
      },
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
