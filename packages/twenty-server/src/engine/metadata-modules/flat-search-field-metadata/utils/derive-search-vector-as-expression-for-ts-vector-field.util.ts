import { type FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import {
  buildSearchVectorTargetField,
  computeSearchVectorAsExpressionFromSearchFieldMetadatas,
} from 'src/engine/metadata-modules/flat-search-field-metadata/utils/compute-search-vector-as-expression-from-search-field-metadatas.util';
import { type FlatSearchFieldMetadata } from 'src/engine/metadata-modules/flat-search-field-metadata/types/flat-search-field-metadata.type';

export const deriveSearchVectorAsExpressionForTsVectorField = ({
  tsVectorFieldMetadataId,
  flatSearchFieldMetadataMaps,
  getIndexedFieldById,
}: {
  tsVectorFieldMetadataId: string;
  flatSearchFieldMetadataMaps: FlatEntityMaps<FlatSearchFieldMetadata>;
  getIndexedFieldById: (
    fieldMetadataId: string,
  ) => { name: string; type: FieldMetadataType } | undefined;
}): string => {
  const targetSearchableFields = Object.values(
    flatSearchFieldMetadataMaps.byUniversalIdentifier,
  )
    .filter(isDefined)
    .filter(
      (flatSearchFieldMetadata) =>
        flatSearchFieldMetadata.tsVectorFieldMetadataId ===
        tsVectorFieldMetadataId,
    )
    .flatMap((flatSearchFieldMetadata) => {
      const indexedField = getIndexedFieldById(
        flatSearchFieldMetadata.fieldMetadataId,
      );

      if (!isDefined(indexedField)) {
        return [];
      }

      return [
        buildSearchVectorTargetField(
          indexedField,
          flatSearchFieldMetadata.position,
          flatSearchFieldMetadata.universalIdentifier,
        ),
      ];
    });

  return computeSearchVectorAsExpressionFromSearchFieldMetadatas(
    targetSearchableFields,
  );
};
