/* @license Enterprise */

import { type FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type RlsRuleRelationHop } from 'src/engine/permissions/internal/access-group/types/rls-rule-relation-hop.type';
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
}): RlsRuleRelationHop[] => {
  if (!isRowLevelPermissionRelationHopEnabled(featureFlagsMap)) {
    return [];
  }

  const comparedFieldMetadataIdsByRelationFieldMetadataId = new Map<
    string,
    Set<string>
  >();

  const predicates = Object.values(rolesPermissions)
    .flatMap(({ objects }) => Object.values(objects))
    .flatMap(
      (objectRecordsPermissions) =>
        objectRecordsPermissions?.rowLevelRecordsPermissions?.predicates ?? [],
    );

  for (const { relationFieldMetadataId, fieldMetadataId } of predicates) {
    const comparedFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: fieldMetadataId,
      flatEntityMaps: flatFieldMetadataMaps,
    });

    if (
      !isDefined(relationFieldMetadataId) ||
      comparedFieldMetadata?.objectMetadataId !== objectMetadataId
    ) {
      continue;
    }

    comparedFieldMetadataIdsByRelationFieldMetadataId.set(
      relationFieldMetadataId,
      (
        comparedFieldMetadataIdsByRelationFieldMetadataId.get(
          relationFieldMetadataId,
        ) ?? new Set<string>()
      ).add(fieldMetadataId),
    );
  }

  return [...comparedFieldMetadataIdsByRelationFieldMetadataId].flatMap(
    ([relationFieldMetadataId, comparedFieldMetadataIds]) => {
      const relationFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: relationFieldMetadataId,
        flatEntityMaps: flatFieldMetadataMaps,
      });

      return isDefined(relationFieldMetadata)
        ? [
            {
              relationFieldMetadata,
              comparedFieldMetadataIds: [...comparedFieldMetadataIds],
            },
          ]
        : [];
    },
  );
};
