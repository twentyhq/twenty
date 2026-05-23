import { compositeTypeDefinitions, RelationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { isMorphOrRelationUniversalFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type GenerateFlatIndexArgs } from 'src/engine/metadata-modules/index-metadata/utils/generate-flat-index.util';
import { generateDeterministicIndexNameV2 } from 'src/engine/metadata-modules/index-metadata/utils/generate-deterministic-index-name-v2';
import { type UniversalFlatIndexMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-index-metadata.type';

// User-created indexes are never unique — uniqueness is owned by the
// field-creation flow. isUnique is forced to false here and in the
// deterministic name hash.
export const generateCustomFlatIndexMetadata = ({
  flatObjectMetadata,
  objectFlatFieldMetadatas,
  flatIndex,
}: GenerateFlatIndexArgs): UniversalFlatIndexMetadata => {
  const orderedIndexColumnNames = flatIndex.universalFlatIndexFieldMetadatas
    .sort((a, b) => a.order - b.order)
    .map((flatIndexField) => {
      const relatedFlatFieldMetadata = objectFlatFieldMetadatas.find(
        (flatFieldMetadata) =>
          flatFieldMetadata.universalIdentifier ===
          flatIndexField.fieldMetadataUniversalIdentifier,
      );

      if (!isDefined(relatedFlatFieldMetadata)) {
        throw new FlatEntityMapsException(
          'Could not find flat index field related field in cache',
          FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
        );
      }

      if (isCompositeFieldMetadataType(relatedFlatFieldMetadata.type)) {
        const compositeType = compositeTypeDefinitions.get(
          relatedFlatFieldMetadata.type,
        );
        const property = compositeType?.properties.find(
          (compositeProperty) =>
            compositeProperty.name === flatIndexField.subFieldName,
        );

        if (!isDefined(property)) {
          throw new FlatEntityMapsException(
            `Composite sub-field "${flatIndexField.subFieldName ?? '(null)'}" not found on ${relatedFlatFieldMetadata.name}`,
            FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
          );
        }

        return computeCompositeColumnName(
          {
            name: relatedFlatFieldMetadata.name,
            type: relatedFlatFieldMetadata.type,
          },
          property,
        );
      }

      const isManyToOneRelation =
        isMorphOrRelationUniversalFlatFieldMetadata(relatedFlatFieldMetadata) &&
        relatedFlatFieldMetadata.universalSettings?.relationType ===
          RelationType.MANY_TO_ONE;

      return isManyToOneRelation
        ? computeMorphOrRelationFieldJoinColumnName({
            name: relatedFlatFieldMetadata.name,
          })
        : relatedFlatFieldMetadata.name;
    });

  const name = generateDeterministicIndexNameV2({
    flatObjectMetadata,
    orderedIndexColumnNames,
    isUnique: false,
    indexWhereClause: flatIndex.indexWhereClause,
  });

  return {
    ...flatIndex,
    name,
    isUnique: false,
  };
};
