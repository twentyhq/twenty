import { isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/core-modules/common/types/all-flat-entity-maps.type';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { FlatObjectMetadataWithFlatFieldMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-with-flat-field-metadata-maps.type';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { generateFlatIndexMetadataWithNameOrThrow } from 'src/engine/metadata-modules/index-metadata/utils/generate-flat-index.util';

type RecomputeIndexAfterFlatObjectMetadataSingularNameUpdateArgs = {
  existingFlatObjectMetadata: FlatObjectMetadataWithFlatFieldMaps;
  updatedSingularName: string;
} & Pick<AllFlatEntityMaps, 'flatIndexMaps'>;
export const recomputeIndexAfterFlatObjectMetadataSingularNameUpdate = ({
  existingFlatObjectMetadata,
  flatIndexMaps,
  updatedSingularName,
}: RecomputeIndexAfterFlatObjectMetadataSingularNameUpdateArgs): FlatIndexMetadata[] => {
  const allReatedFlatIndexMetadata = Object.values(flatIndexMaps.byId).filter(
    (flatIndexMetadata): flatIndexMetadata is FlatIndexMetadata =>
      isDefined(flatIndexMetadata) &&
      flatIndexMetadata.objectMetadataId === existingFlatObjectMetadata.id,
  );

  if (allReatedFlatIndexMetadata.length === 0) {
    return [];
  }

  const optimisticFlatObjectMetadata: FlatObjectMetadata = {
    ...existingFlatObjectMetadata,
    nameSingular: updatedSingularName,
  };

  return allReatedFlatIndexMetadata.map<FlatIndexMetadata>((flatIndex) => {
    const newIndex = generateFlatIndexMetadataWithNameOrThrow({
      flatIndex,
      flatObjectMetadata: optimisticFlatObjectMetadata,
    });

    return newIndex;
  });
};
