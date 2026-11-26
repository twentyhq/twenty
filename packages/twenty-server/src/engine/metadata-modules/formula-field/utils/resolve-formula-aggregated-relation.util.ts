import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const resolveFormulaAggregatedRelation = ({
  relationFlatFieldMetadata,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: {
  relationFlatFieldMetadata: OrmFlatFieldMetadata | undefined;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
}):
  | { relatedFlatObjectMetadata: FlatObjectMetadata; joinColumnName: string }
  | undefined => {
  if (
    !isDefined(relationFlatFieldMetadata) ||
    !isFlatFieldMetadataOfType(
      relationFlatFieldMetadata,
      FieldMetadataType.RELATION,
    ) ||
    relationFlatFieldMetadata.settings?.relationType !==
      RelationType.ONE_TO_MANY ||
    !isDefined(relationFlatFieldMetadata.relationTargetFieldMetadataId) ||
    !isDefined(relationFlatFieldMetadata.relationTargetObjectMetadataId)
  ) {
    return undefined;
  }

  const inverseRelationFlatFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: relationFlatFieldMetadata.relationTargetFieldMetadataId,
    flatEntityMaps: flatFieldMetadataMaps,
  });
  const relatedFlatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: relationFlatFieldMetadata.relationTargetObjectMetadataId,
    flatEntityMaps: flatObjectMetadataMaps,
  });

  if (
    !isDefined(inverseRelationFlatFieldMetadata) ||
    !isDefined(relatedFlatObjectMetadata)
  ) {
    return undefined;
  }

  return {
    relatedFlatObjectMetadata,
    joinColumnName: computeMorphOrRelationFieldJoinColumnName({
      name: inverseRelationFlatFieldMetadata.name,
    }),
  };
};
