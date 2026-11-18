import { RelationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { isRelationUniversalFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-relation-universal-flat-field-metadata-of-type.util';
import { resolveEffectiveUniversalFlatEntityProperty } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-universal-flat-entity-property.util';
import { isMorphOrRelationFieldMetadataType } from 'src/engine/utils/is-morph-or-relation-field-metadata-type.util';
import { type AllUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/all-universal-flat-entity-maps.type';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

export type RelationTargetFlatFieldMetadataFailureReason =
  | 'NOT_A_MANY_TO_ONE_RELATION'
  | 'NOT_ON_RELATION_TARGET_OBJECT'
  | 'INACTIVE'
  | 'IS_A_RELATION';

export const resolveRelationTargetFlatFieldMetadata = ({
  flatFieldMetadata,
  relationTargetFieldMetadataUniversalIdentifier,
  flatFieldMetadataMaps,
}: {
  flatFieldMetadata: UniversalFlatFieldMetadata;
  relationTargetFieldMetadataUniversalIdentifier: string;
  flatFieldMetadataMaps: AllUniversalFlatEntityMaps['flatFieldMetadataMaps'];
}):
  | { relationTargetFlatFieldMetadata: UniversalFlatFieldMetadata }
  | { failureReason: RelationTargetFlatFieldMetadataFailureReason } => {
  if (
    !isRelationUniversalFlatFieldMetadataOfType({
      flatFieldMetadata,
      relationType: RelationType.MANY_TO_ONE,
    })
  ) {
    return { failureReason: 'NOT_A_MANY_TO_ONE_RELATION' };
  }

  const relationTargetFlatFieldMetadata = findFlatEntityByUniversalIdentifier({
    universalIdentifier: relationTargetFieldMetadataUniversalIdentifier,
    flatEntityMaps: flatFieldMetadataMaps,
  });

  if (
    !isDefined(relationTargetFlatFieldMetadata) ||
    relationTargetFlatFieldMetadata.objectMetadataUniversalIdentifier !==
      flatFieldMetadata.relationTargetObjectMetadataUniversalIdentifier
  ) {
    return { failureReason: 'NOT_ON_RELATION_TARGET_OBJECT' };
  }

  if (
    !resolveEffectiveUniversalFlatEntityProperty({
      metadataName: 'fieldMetadata',
      universalFlatEntity: relationTargetFlatFieldMetadata,
      property: 'isActive',
    })
  ) {
    return { failureReason: 'INACTIVE' };
  }

  if (
    isMorphOrRelationFieldMetadataType(relationTargetFlatFieldMetadata.type)
  ) {
    return { failureReason: 'IS_A_RELATION' };
  }

  return { relationTargetFlatFieldMetadata };
};
