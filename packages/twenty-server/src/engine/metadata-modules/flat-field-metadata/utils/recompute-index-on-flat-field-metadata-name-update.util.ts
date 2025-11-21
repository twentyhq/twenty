import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findManyFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { generateFlatIndexMetadataWithNameOrThrow } from 'src/engine/metadata-modules/index-metadata/utils/generate-flat-index.util';

type RecomputeIndexOnFlatFieldMetadataNameUpdateArgs = {
  flatObjectMetadata: FlatObjectMetadata;
  fromFlatFieldMetadata: FlatFieldMetadata;
  toFlatFieldMetadata: Pick<FlatFieldMetadata, 'name' | 'isUnique'>;
  relatedFlatIndexMetadata: FlatIndexMetadata[];
} & Pick<AllFlatEntityMaps, 'flatFieldMetadataMaps'>;

export const recomputeIndexOnFlatFieldMetadataNameUpdate = ({
  fromFlatFieldMetadata,
  toFlatFieldMetadata,
  flatObjectMetadata,
  flatFieldMetadataMaps,
  relatedFlatIndexMetadata,
}: RecomputeIndexOnFlatFieldMetadataNameUpdateArgs): FlatIndexMetadata[] => {
  if (relatedFlatIndexMetadata.length === 0) {
    return [];
  }

  const objectFlatFieldMetadatas =
    findManyFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityMaps: flatFieldMetadataMaps,
      flatEntityIds: flatObjectMetadata.fieldMetadataIds,
    });
  const optimisticObjectFlatFieldMetadatas = objectFlatFieldMetadatas.map(
    (flatFieldMetadata) => {
      if (flatFieldMetadata.id === fromFlatFieldMetadata.id) {
        return {
          ...flatFieldMetadata,
          name: toFlatFieldMetadata.name,
          isUnique: toFlatFieldMetadata.isUnique,
        };
      }

      return flatFieldMetadata;
    },
  );

  return relatedFlatIndexMetadata.map((flatIndex) =>
    generateFlatIndexMetadataWithNameOrThrow({
      flatIndex,
      flatObjectMetadata,
      objectFlatFieldMetadatas: optimisticObjectFlatFieldMetadatas,
    }),
  );
};
