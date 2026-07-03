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
import { generateDeterministicIndexName } from 'src/engine/metadata-modules/index-metadata/utils/generate-deterministic-index-name';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatIndexFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-index-metadata.type';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';

type ComputeFlatIndexNameArgs = {
  flatObjectMetadata: UniversalFlatObjectMetadata;
  objectFlatFieldMetadatas: UniversalFlatFieldMetadata[];
  indexFields: Pick<
    UniversalFlatIndexFieldMetadata,
    'order' | 'fieldMetadataUniversalIdentifier' | 'subFieldName'
  >[];
  isUnique: boolean;
  indexWhereClause: string | null;
};

export const computeFlatIndexNameOrThrow = ({
  flatObjectMetadata,
  objectFlatFieldMetadatas,
  indexFields,
  isUnique,
  indexWhereClause,
}: ComputeFlatIndexNameArgs): string => {
  const orderedIndexColumnNames = [...indexFields]
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

      if (
        isCompositeFieldMetadataType(relatedFlatFieldMetadata.type) &&
        isDefined(flatIndexField.subFieldName)
      ) {
        const property = compositeTypeDefinitions
          .get(relatedFlatFieldMetadata.type)
          ?.properties.find(
            (compositeProperty) =>
              compositeProperty.name === flatIndexField.subFieldName,
          );

        if (!isDefined(property)) {
          throw new FlatEntityMapsException(
            `Composite sub-field "${flatIndexField.subFieldName}" not found on ${relatedFlatFieldMetadata.name}`,
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

  return generateDeterministicIndexName({
    flatObjectMetadata,
    orderedIndexColumnNames,
    isUnique,
    indexWhereClause,
  });
};
