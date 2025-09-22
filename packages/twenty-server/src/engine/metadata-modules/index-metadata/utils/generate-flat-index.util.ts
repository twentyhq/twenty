import {
    FlatEntityMapsException,
    FlatEntityMapsExceptionCode,
} from 'src/engine/core-modules/common/exceptions/flat-entity-maps.exception';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { generateDeterministicIndexNameV2 } from 'src/engine/metadata-modules/index-metadata/utils/generate-deterministic-index-name-v2';
import { isDefined } from 'twenty-shared/utils';

type GenerateFlatIndexArgs = {
  flatObjectMetadata: FlatObjectMetadata;
  flatIndex: Omit<FlatIndexMetadata, 'name'>;
};
// TODO rename
export const generateFlatIndexMetadataWithNameOrThrow = ({
  flatObjectMetadata,
  flatIndex,
}: GenerateFlatIndexArgs): FlatIndexMetadata => {
  const orderedFlatFieldNames = flatIndex.flatIndexFieldMetadatas
    .sort((a, b) => a.order - b.order)
    .map((flatIndexField) => {
      const relatedFlatFieldMetadata =
        flatObjectMetadata.flatFieldMetadatas.find(
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
