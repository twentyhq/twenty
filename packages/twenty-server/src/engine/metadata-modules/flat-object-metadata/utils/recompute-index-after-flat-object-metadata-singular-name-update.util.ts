import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findManyFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { generateFlatIndexMetadataWithNameOrThrow } from 'src/engine/metadata-modules/index-metadata/utils/generate-flat-index.util';

type RecomputeIndexAfterFlatObjectMetadataSingularNameUpdateArgs = {
  existingFlatObjectMetadata: FlatObjectMetadata;
  updatedSingularName: string;
} & Pick<AllFlatEntityMaps, 'flatIndexMaps' | 'flatFieldMetadataMaps'>;
export const recomputeIndexAfterFlatObjectMetadataSingularNameUpdate = ({
  existingFlatObjectMetadata,
  flatIndexMaps,
  updatedSingularName,
  flatFieldMetadataMaps,
}: RecomputeIndexAfterFlatObjectMetadataSingularNameUpdateArgs): FlatIndexMetadata[] => {
  const allRelatedFlatIndexMetadata =
    findManyFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityIds: existingFlatObjectMetadata.indexMetadataIds,
      flatEntityMaps: flatIndexMaps,
    });

  if (allRelatedFlatIndexMetadata.length === 0) {
    return [];
  }

  const optimisticFlatObjectMetadata: FlatObjectMetadata = {
    ...existingFlatObjectMetadata,
    nameSingular: updatedSingularName,
  };

  const objectFlatFieldMetadatas =
    findManyFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityMaps: flatFieldMetadataMaps,
      flatEntityIds: optimisticFlatObjectMetadata.fieldMetadataIds,
    });

  return allRelatedFlatIndexMetadata.map<FlatIndexMetadata>((flatIndex) => {
    const newIndex = generateFlatIndexMetadataWithNameOrThrow({
      flatIndex,
      flatObjectMetadata: optimisticFlatObjectMetadata,
      objectFlatFieldMetadatas,
    });

    return newIndex;
  });
};
