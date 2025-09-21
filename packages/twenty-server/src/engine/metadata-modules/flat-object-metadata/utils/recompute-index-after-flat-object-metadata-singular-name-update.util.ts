import { isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/core-modules/common/types/all-flat-entity-maps.type';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { generateDeterministicIndexNameV2 } from 'src/engine/metadata-modules/index-metadata/utils/generate-deterministic-index-name-v2';

type RecomputeIndexAfterFlatObjectMetadataSingularNameUpdateArgs = {
  existingFlatObjectMetadata: FlatObjectMetadata;
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

  return allReatedFlatIndexMetadata.map<FlatIndexMetadata>(
    (flatIndexMetadata) => ({
      ...flatIndexMetadata,
      name: generateDeterministicIndexNameV2({
        flatFieldMetadatas: existingFlatObjectMetadata.flatFieldMetadatas,
        flatObjectMetadata: {
          isCustom: existingFlatObjectMetadata.isCustom,
          nameSingular: updatedSingularName,
        },
      }),
    }),
  );
};
