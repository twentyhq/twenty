import { isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/core-modules/common/types/all-flat-entity-maps.type';
import { findObjectFlatFieldMetadatasOrThrow } from 'src/engine/metadata-modules/flat-field-metadata/utils/find-object-fields-in-flat-field-metadata-maps-or-throw.util';
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
  const allRelatedFlatIndexMetadata = Object.values(flatIndexMaps.byId).filter(
    (flatIndexMetadata): flatIndexMetadata is FlatIndexMetadata =>
      isDefined(flatIndexMetadata) &&
      flatIndexMetadata.objectMetadataId === existingFlatObjectMetadata.id,
  );

  if (allRelatedFlatIndexMetadata.length === 0) {
    return [];
  }

  const optimisticFlatObjectMetadata: FlatObjectMetadata = {
    ...existingFlatObjectMetadata,
    nameSingular: updatedSingularName,
  };

  const { objectFlatFieldMetadatas } = findObjectFlatFieldMetadatasOrThrow({
    flatFieldMetadataMaps,
    flatObjectMetadata: optimisticFlatObjectMetadata,
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
