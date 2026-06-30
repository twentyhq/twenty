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
  indexedFieldById,
}: {
  tsVectorFieldMetadataId: string;
  flatSearchFieldMetadataMaps: FlatEntityMaps<FlatSearchFieldMetadata>;
  indexedFieldById: ReadonlyMap<
    string,
    { name: string; type: FieldMetadataType }
  >;
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
      const indexedField = indexedFieldById.get(
        flatSearchFieldMetadata.fieldMetadataId,
      );

      if (!isDefined(indexedField)) {
        return [];
      }

      return [
        buildSearchVectorTargetField({
          field: indexedField,
          position: flatSearchFieldMetadata.position,
          sortKey: flatSearchFieldMetadata.universalIdentifier,
        }),
      ];
    });

  return computeSearchVectorAsExpressionFromSearchFieldMetadatas(
    targetSearchableFields,
  );
};
