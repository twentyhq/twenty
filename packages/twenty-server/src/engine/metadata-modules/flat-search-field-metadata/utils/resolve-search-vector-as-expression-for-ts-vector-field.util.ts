import { type FieldMetadataType } from 'twenty-shared/types';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatSearchFieldMetadata } from 'src/engine/metadata-modules/flat-search-field-metadata/types/flat-search-field-metadata.type';
import { deriveSearchVectorAsExpressionForTsVectorField } from 'src/engine/metadata-modules/flat-search-field-metadata/utils/derive-search-vector-as-expression-for-ts-vector-field.util';
import { getTargetSearchFieldMetadatasForTsVectorField } from 'src/engine/metadata-modules/flat-search-field-metadata/utils/get-target-search-field-metadatas-for-ts-vector-field.util';

type ResolvableFlatFieldMetadata = {
  id: string;
  name: string;
  type: FieldMetadataType;
};

export const resolveSearchVectorAsExpressionForTsVectorField = ({
  tsVectorFieldMetadataId,
  objectFlatFieldMetadatas,
  flatSearchFieldMetadataMaps,
  getSearchFieldMetadatasByTsVectorFieldId,
}: {
  tsVectorFieldMetadataId: string;
  objectFlatFieldMetadatas: ResolvableFlatFieldMetadata[];
  flatSearchFieldMetadataMaps: FlatEntityMaps<FlatSearchFieldMetadata>;
  getSearchFieldMetadatasByTsVectorFieldId?: (
    tsVectorFieldMetadataId: string,
  ) => FlatSearchFieldMetadata[];
}): string =>
  deriveSearchVectorAsExpressionForTsVectorField({
    targetSearchFieldMetadatas:
      getSearchFieldMetadatasByTsVectorFieldId?.(tsVectorFieldMetadataId) ??
      getTargetSearchFieldMetadatasForTsVectorField({
        tsVectorFieldMetadataId,
        flatSearchFieldMetadataMaps,
      }),
    indexedFieldById: new Map(
      objectFlatFieldMetadatas.map((objectFlatFieldMetadata) => [
        objectFlatFieldMetadata.id,
        {
          name: objectFlatFieldMetadata.name,
          type: objectFlatFieldMetadata.type,
        },
      ]),
    ),
  });
