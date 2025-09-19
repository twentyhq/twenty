import { AllFlatEntityMaps } from 'src/engine/core-modules/common/types/all-flat-entity-maps.type';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { generateDeterministicIndexNameV2 } from 'src/engine/metadata-modules/index-metadata/utils/generate-deterministic-index-name-v2';
import { isDefined } from 'twenty-shared/utils';

type RecomputeIndexOnFlatFieldMetadataNameUpdateArgs = {
  flatObjectMetadata: FlatObjectMetadata;
  fromFlatFieldMetadata: FlatFieldMetadata;
  toFlatFieldMetadata: {
    name: string;
    isUnique?: boolean;
  };
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

  return relatedFlatIndexMetadata.map<FlatIndexMetadata>(
    (flatIndexMetadata) => {
      const relatedFlatFieldMetadata =
        flatObjectMetadata.flatFieldMetadatas.flatMap<
          Pick<FlatFieldMetadata, 'name'>
        >((flatFieldMetadata) => {
          const isUnrelatedFieldMetadata =
            !flatIndexMetadata.flatIndexFieldMetadatas.some(
              (flatIndexField) =>
                flatIndexField.fieldMetadataId === flatFieldMetadata.id,
            );
          if (isUnrelatedFieldMetadata) {
            return [];
          }
          return {
            name:
              flatFieldMetadata.id === fromFlatFieldMetadata.id
                ? toFlatFieldMetadata.name
                : flatFieldMetadata.name,
          };
        });

      return {
        ...flatIndexMetadata,
        name: generateDeterministicIndexNameV2({
          flatFieldMetadatas: relatedFlatFieldMetadata,
          flatObjectMetadata,
          isUnique:
            toFlatFieldMetadata.isUnique ??
            fromFlatFieldMetadata.isUnique ??
            false,
        }),
      };
    },
  );
};
