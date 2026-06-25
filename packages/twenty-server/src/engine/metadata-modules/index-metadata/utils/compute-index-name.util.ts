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
import { generateDeterministicIndexNameV2 } from 'src/engine/metadata-modules/index-metadata/utils/generate-deterministic-index-name-v2';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';

export type IndexFieldNameDescriptor = {
  fieldMetadataUniversalIdentifier: string;
  subFieldName: string | null;
  order: number;
};

export const computeIndexName = ({
  flatObjectMetadata,
  objectFlatFieldMetadatas,
  indexFieldDescriptors,
  isUnique,
  indexWhereClause,
}: {
  flatObjectMetadata: UniversalFlatObjectMetadata;
  objectFlatFieldMetadatas: UniversalFlatFieldMetadata[];
  indexFieldDescriptors: IndexFieldNameDescriptor[];
  isUnique: boolean;
  indexWhereClause: string | null;
}): string => {
  const orderedIndexColumnNames = [...indexFieldDescriptors]
    .sort((a, b) => a.order - b.order)
    .map((indexFieldDescriptor) => {
      const relatedFlatFieldMetadata = objectFlatFieldMetadatas.find(
        (flatFieldMetadata) =>
          flatFieldMetadata.universalIdentifier ===
          indexFieldDescriptor.fieldMetadataUniversalIdentifier,
      );

      if (!isDefined(relatedFlatFieldMetadata)) {
        throw new FlatEntityMapsException(
          'Could not find flat index field related field in cache',
          FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
        );
      }

      if (
        isCompositeFieldMetadataType(relatedFlatFieldMetadata.type) &&
        isDefined(indexFieldDescriptor.subFieldName)
      ) {
        const property = compositeTypeDefinitions
          .get(relatedFlatFieldMetadata.type)
          ?.properties.find(
            (compositeProperty) =>
              compositeProperty.name === indexFieldDescriptor.subFieldName,
          );

        if (!isDefined(property)) {
          throw new FlatEntityMapsException(
            `Composite sub-field "${indexFieldDescriptor.subFieldName}" not found on ${relatedFlatFieldMetadata.name}`,
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

  return generateDeterministicIndexNameV2({
    flatObjectMetadata,
    orderedIndexColumnNames,
    isUnique,
    indexWhereClause,
  });
};
