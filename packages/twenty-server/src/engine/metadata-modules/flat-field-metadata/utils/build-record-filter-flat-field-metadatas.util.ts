import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

// A morph relation head has no join column, so record filters on it need the targets to know which columns to check.
export const buildRecordFilterFlatFieldMetadatas = ({
  flatFieldMetadataMaps,
  flatObjectMetadataMaps,
}: {
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
}) => {
  const flatFieldMetadatas = Object.values(
    flatFieldMetadataMaps.byUniversalIdentifier,
  ).filter(isDefined);

  const morphRelationTargetsByMorphId = new Map<
    string,
    FlatFieldMetadata<FieldMetadataType.MORPH_RELATION>[]
  >();

  for (const flatFieldMetadata of flatFieldMetadatas) {
    if (
      !isFlatFieldMetadataOfType(
        flatFieldMetadata,
        FieldMetadataType.MORPH_RELATION,
      ) ||
      flatFieldMetadata.universalIdentifier === flatFieldMetadata.morphId
    ) {
      continue;
    }

    morphRelationTargetsByMorphId.set(flatFieldMetadata.morphId, [
      ...(morphRelationTargetsByMorphId.get(flatFieldMetadata.morphId) ?? []),
      flatFieldMetadata,
    ]);
  }

  return flatFieldMetadatas.map((flatFieldMetadata) => {
    if (
      !isFlatFieldMetadataOfType(
        flatFieldMetadata,
        FieldMetadataType.MORPH_RELATION,
      ) ||
      flatFieldMetadata.universalIdentifier !== flatFieldMetadata.morphId
    ) {
      return flatFieldMetadata;
    }

    const morphRelations = (
      morphRelationTargetsByMorphId.get(flatFieldMetadata.morphId) ?? []
    ).flatMap((target) => {
      const targetObject = isDefined(target.relationTargetObjectMetadataId)
        ? findFlatEntityByIdInFlatEntityMaps({
            flatEntityId: target.relationTargetObjectMetadataId,
            flatEntityMaps: flatObjectMetadataMaps,
          })
        : undefined;

      if (!isDefined(targetObject)) {
        return [];
      }

      return [
        {
          type: target.settings.relationType,
          targetObjectMetadata: {
            id: targetObject.id,
            nameSingular: targetObject.nameSingular,
            namePlural: targetObject.namePlural,
          },
        },
      ];
    });

    return { ...flatFieldMetadata, morphRelations };
  });
};
