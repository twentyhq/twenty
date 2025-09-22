import { isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/core-modules/common/types/all-flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { generateFlatIndexMetadataWithNameOrThrow } from 'src/engine/metadata-modules/index-metadata/utils/generate-flat-index.util';

type RecomputeIndexOnFlatFieldMetadataNameUpdateArgs = {
  flatObjectMetadata: FlatObjectMetadata;
  fromFlatFieldMetadata: FlatFieldMetadata;
  toFlatFieldMetadata: Pick<FlatFieldMetadata, 'name'>;
} & Pick<AllFlatEntityMaps, 'flatIndexMaps'>;

export const recomputeIndexOnFlatFieldMetadataNameUpdate = ({
  fromFlatFieldMetadata,
  toFlatFieldMetadata,
  flatObjectMetadata,
  flatIndexMaps,
}: RecomputeIndexOnFlatFieldMetadataNameUpdateArgs): FlatIndexMetadata[] => {
  const relatedFlatIndexMetadata = Object.values(flatIndexMaps.byId).filter(
    (flatIndexMetadata): flatIndexMetadata is FlatIndexMetadata =>
      isDefined(flatIndexMetadata) &&
      flatIndexMetadata.objectMetadataId ===
        fromFlatFieldMetadata.objectMetadataId &&
      flatIndexMetadata.flatIndexFieldMetadatas.some(
        (flatIndexField) =>
          flatIndexField.fieldMetadataId === fromFlatFieldMetadata.id,
      ),
  );

  if (relatedFlatIndexMetadata.length === 0) {
    return [];
  }

  const optimisticFlatObjectMetadata = {
    ...flatObjectMetadata,
    flatFieldMetadatas: flatObjectMetadata.flatFieldMetadatas.map(
      (flatFieldMetadata) => {
        if (flatFieldMetadata.id === fromFlatFieldMetadata.id) {
          return {
            ...flatFieldMetadata,
            name: toFlatFieldMetadata.name,
          };
        }

        return flatFieldMetadata;
      },
    ),
  };

  return relatedFlatIndexMetadata.map<FlatIndexMetadata>((flatIndex) => {
    const newIndex = generateFlatIndexMetadataWithNameOrThrow({
      flatObjectMetadata: optimisticFlatObjectMetadata,
      flatIndex,
    });

    return newIndex;
  });
};
