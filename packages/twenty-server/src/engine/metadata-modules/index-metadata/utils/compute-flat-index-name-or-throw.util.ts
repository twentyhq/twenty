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

type FlatIndexFieldForName = {
  fieldMetadataUniversalIdentifier: string;
  order: number;
  subFieldName: string | null;
};

export const computeFlatIndexNameOrThrow = ({
  flatObjectMetadata,
  objectFlatFieldMetadatas,
  universalFlatIndexFieldMetadatas,
  isUnique,
  indexWhereClause,
}: {
  flatObjectMetadata: UniversalFlatObjectMetadata;
  objectFlatFieldMetadatas: UniversalFlatFieldMetadata[];
  universalFlatIndexFieldMetadatas: FlatIndexFieldForName[];
  isUnique: boolean;
  indexWhereClause: string | null;
}): string => {
  const orderedIndexColumnNames = [...universalFlatIndexFieldMetadatas]
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

      // Composite parent with an explicit sub-field → single sub-column.
      // Composite parent without sub-field falls through to the legacy
      // scalar branch below, which produces a deterministic name based on
      // the parent name (the runner handles the multi-column SQL expansion
      // via isIncludedInUniqueConstraint).
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

  return generateDeterministicIndexNameV2({
    flatObjectMetadata,
    orderedIndexColumnNames,
    isUnique,
    indexWhereClause,
  });
};
