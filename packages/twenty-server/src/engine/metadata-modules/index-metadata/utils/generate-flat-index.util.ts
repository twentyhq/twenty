import { isDefined } from 'twenty-shared/utils';

import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/core-modules/common/exceptions/flat-entity-maps.exception';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { generateDeterministicIndexNameV2 } from 'src/engine/metadata-modules/index-metadata/utils/generate-deterministic-index-name-v2';

type GenerateFlatIndexArgs = {
  flatObjectMetadata: FlatObjectMetadata;
  objectFlatFieldMetadatas: FlatFieldMetadata[];
  flatIndex: Omit<FlatIndexMetadata, 'name'>;
};
export const generateFlatIndexMetadataWithNameOrThrow = ({
  flatObjectMetadata,
  objectFlatFieldMetadatas,
  flatIndex,
}: GenerateFlatIndexArgs): FlatIndexMetadata => {
  const orderedFlatFieldNames = flatIndex.flatIndexFieldMetadatas
    .sort((a, b) => a.order - b.order)
    .map((flatIndexField) => {
      const relatedFlatFieldMetadata = objectFlatFieldMetadatas.find(
        (flatFieldMetadata) =>
          flatFieldMetadata.id === flatIndexField.fieldMetadataId,
      );

      if (!isDefined(relatedFlatFieldMetadata)) {
        throw new FlatEntityMapsException(
          'Could not find flat index field related field in cache',
          FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
        );
      }

      const name = isMorphOrRelationFlatFieldMetadata(relatedFlatFieldMetadata)
        ? (relatedFlatFieldMetadata.settings.joinColumnName ??
          relatedFlatFieldMetadata.name)
        : relatedFlatFieldMetadata.name;

      return {
        name,
      };
    });

  const name = generateDeterministicIndexNameV2({
    flatObjectMetadata,
    isUnique: flatIndex.isUnique,
    relatedFieldNames: orderedFlatFieldNames,
  });

  return {
    ...flatIndex,
    name,
  };
};
