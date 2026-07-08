import { Logger } from '@nestjs/common';

import { type FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import {
  buildSearchVectorTargetField,
  computeSearchVectorAsExpressionFromSearchFieldMetadatas,
} from 'src/engine/metadata-modules/flat-search-field-metadata/utils/compute-search-vector-as-expression-from-search-field-metadatas.util';
import { type FlatSearchFieldMetadata } from 'src/engine/metadata-modules/flat-search-field-metadata/types/flat-search-field-metadata.type';

const logger = new Logger('deriveSearchVectorAsExpressionForTsVectorField');

export const deriveSearchVectorAsExpressionForTsVectorField = ({
  targetSearchFieldMetadatas,
  indexedFieldById,
  objectMetadataNameSingular,
}: {
  targetSearchFieldMetadatas: FlatSearchFieldMetadata[];
  indexedFieldById: ReadonlyMap<
    string,
    { name: string; type: FieldMetadataType }
  >;
  objectMetadataNameSingular?: string;
}): string => {
  const targetSearchableFields = targetSearchFieldMetadatas.flatMap(
    (flatSearchFieldMetadata) => {
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
    },
  );

  if (targetSearchableFields.length === 0) {
    logger.error(
      `Deriving searchVector expression with zero target search fields${
        isDefined(objectMetadataNameSingular)
          ? ` for object "${objectMetadataNameSingular}"`
          : ''
      }; the searchVector column will be NULL and full-text search will not work.`,
    );
  }

  return computeSearchVectorAsExpressionFromSearchFieldMetadatas(
    targetSearchableFields,
  );
};
