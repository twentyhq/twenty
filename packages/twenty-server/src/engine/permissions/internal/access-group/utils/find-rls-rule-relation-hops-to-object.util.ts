/* @license Enterprise */

import { type FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { isRowLevelPermissionRelationHopEnabled } from 'src/engine/permissions/internal/rls/utils/is-row-level-permission-relation-hop-enabled.util';
import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';

export const findRlsRuleRelationHopsToObject = ({
  featureFlagsMap,
  rolesPermissions,
  flatFieldMetadataMaps,
  objectMetadataId,
}: {
  featureFlagsMap: Partial<Record<FeatureFlagKey, boolean>>;
  rolesPermissions: Record<string, RoleRecordsPermissions>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  objectMetadataId: string;
}): OrmFlatFieldMetadata[] => {
  if (!isRowLevelPermissionRelationHopEnabled(featureFlagsMap)) {
    return [];
  }

  const relationFieldMetadataIds = new Set(
    Object.values(rolesPermissions)
      .flatMap(({ objects }) => Object.values(objects))
      .flatMap(
        (objectRecordsPermissions) =>
          objectRecordsPermissions?.rowLevelRecordsPermissions?.predicates ??
          [],
      )
      .filter(({ relationFieldMetadataId, fieldMetadataId }) => {
        const targetFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: fieldMetadataId,
          flatEntityMaps: flatFieldMetadataMaps,
        });

        return (
          isDefined(relationFieldMetadataId) &&
          targetFieldMetadata?.objectMetadataId === objectMetadataId
        );
      })
      .map(({ relationFieldMetadataId }) => relationFieldMetadataId)
      .filter(isDefined),
  );

  return [...relationFieldMetadataIds]
    .map((relationFieldMetadataId) =>
      findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: relationFieldMetadataId,
        flatEntityMaps: flatFieldMetadataMaps,
      }),
    )
    .filter(isDefined);
};
