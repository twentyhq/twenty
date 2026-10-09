import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { isMorphRelationGroup } from 'twenty-shared/utils';
import { FieldMetadataType } from 'twenty-shared/types';

import { findMorphRelationGroupOrThrow } from 'src/engine/metadata-modules/flat-field-metadata/utils/find-morph-relation-group-or-throw.util';
import { isRelationFieldMetadataWithTarget } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-relation-field-metadata-with-target.util';
import { RelationDTO } from 'src/engine/metadata-modules/field-metadata/dtos/relation.dto';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { findAllOthersMorphRelationFlatFieldMetadatasOrThrow } from 'src/engine/metadata-modules/flat-field-metadata/utils/find-all-others-morph-relation-flat-field-metadatas-or-throw.util';
import { fromMorphOrRelationFlatFieldMetadataToRelationDto } from 'src/engine/metadata-modules/flat-field-metadata/utils/from-morph-or-relation-flat-field-metadata-to-relation-dto.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

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
  const group = findMorphRelationGroupOrThrow({
    morphFieldMetadata: morphFlatFieldMetadata,
    flatFieldMetadataMaps,
  });
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
    if (isMorphRelationGroup(sourceFlatFieldMetadata)) {
      return [];
    }
    if (!isRelationFieldMetadataWithTarget(sourceFlatFieldMetadata)) {
      throw new FieldMetadataException(
        'Morph relation target is missing its target metadata IDs',
        FieldMetadataExceptionCode.FIELD_METADATA_RELATION_MALFORMED,
      );
    }

    const targetFlatFieldMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: sourceFlatFieldMetadata.relationTargetFieldMetadataId,
      flatEntityMaps: flatFieldMetadataMaps,
    });

    if (!isRelationFieldMetadataWithTarget(targetFlatFieldMetadata)) {
      throw new FieldMetadataException(
        `Inverse relation "${targetFlatFieldMetadata.name}" is missing its target metadata IDs`,
        FieldMetadataExceptionCode.FIELD_METADATA_RELATION_MALFORMED,
      );
    }

    const targetFlatObjectMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: sourceFlatFieldMetadata.relationTargetObjectMetadataId,
      flatEntityMaps: flatObjectMetadataMaps,
    });

    return fromMorphOrRelationFlatFieldMetadataToRelationDto({
      sourceFlatFieldMetadata: {
        ...sourceFlatFieldMetadata,
        name: group.name,
      },
      targetFlatFieldMetadata,
      targetFlatObjectMetadata,
      sourceFlatObjectMetadata,
    });
  });
};
