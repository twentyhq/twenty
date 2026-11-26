/* @license Enterprise */

import { type RowLevelPermissionPredicate } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { isRlsOneToManyEmptinessPredicate } from 'src/engine/permissions/internal/rls/utils/is-rls-one-to-many-emptiness-predicate.util';
import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';

// Emptiness of a one-to-many relation reads the target's join column, like a hop through it
const toRelationHopShape = ({
  predicate,
  flatFieldMetadataMaps,
}: {
  predicate: RowLevelPermissionPredicate;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
}): RowLevelPermissionPredicate => {
  const fieldMetadata = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: predicate.fieldMetadataId,
    flatEntityMaps: flatFieldMetadataMaps,
  });

  if (
    !isDefined(fieldMetadata) ||
    !isDefined(fieldMetadata.relationTargetFieldMetadataId) ||
    !isRlsOneToManyEmptinessPredicate({ predicate, fieldMetadata })
  ) {
    return predicate;
  }

  return {
    ...predicate,
    relationFieldMetadataId: fieldMetadata.id,
    fieldMetadataId: fieldMetadata.relationTargetFieldMetadataId,
  };
};

export const findRlsRuleRelationPredicatesToObject = ({
  rolesPermissions,
  flatFieldMetadataMaps,
  objectMetadataId,
}: {
  rolesPermissions: Record<string, RoleRecordsPermissions>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  objectMetadataId: string;
}): RowLevelPermissionPredicate[] => {
  return Object.values(rolesPermissions)
    .flatMap(({ objects }) => Object.values(objects))
    .flatMap((objectRecordsPermissions) =>
      (objectRecordsPermissions?.rowLevelRecordsPermissions ?? []).flatMap(
        ({ predicates }) => predicates,
      ),
    )
    .map((predicate) =>
      toRelationHopShape({ predicate, flatFieldMetadataMaps }),
    )
    .filter(
      ({ relationFieldMetadataId, fieldMetadataId }) =>
        isDefined(relationFieldMetadataId) &&
        isDefined(
          findFlatEntityByIdInFlatEntityMaps({
            flatEntityId: relationFieldMetadataId,
            flatEntityMaps: flatFieldMetadataMaps,
          }),
        ) &&
        findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: fieldMetadataId,
          flatEntityMaps: flatFieldMetadataMaps,
        })?.objectMetadataId === objectMetadataId,
    );
};
