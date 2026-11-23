/* @license Enterprise */

import {
  type FeatureFlagKey,
  type RowLevelPermissionPredicate,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { isRlsRelationHopEnabled } from 'src/engine/permissions/internal/rls/utils/is-rls-relation-hop-enabled.util';
import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';

export const findRlsRuleRelationPredicatesToObject = ({
  featureFlagsMap,
  rolesPermissions,
  flatFieldMetadataMaps,
  objectMetadataId,
}: {
  featureFlagsMap: Partial<Record<FeatureFlagKey, boolean>>;
  rolesPermissions: Record<string, RoleRecordsPermissions>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  objectMetadataId: string;
}): RowLevelPermissionPredicate[] => {
  if (!isRlsRelationHopEnabled(featureFlagsMap)) {
    return [];
  }

  return Object.values(rolesPermissions)
    .flatMap(({ objects }) => Object.values(objects))
    .flatMap((objectRecordsPermissions) =>
      (objectRecordsPermissions?.rowLevelRecordsPermissions ?? []).flatMap(
        ({ predicates }) => predicates,
      ),
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
