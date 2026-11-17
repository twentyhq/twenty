/* @license Enterprise */

import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatRoleMaps } from 'src/engine/metadata-modules/flat-role/types/flat-role-maps.type';

export const findAssignedRoleId = ({
  roleIds,
  flatRoleMaps,
}: {
  roleIds: string[];
  flatRoleMaps: FlatRoleMaps;
}): string | undefined =>
  roleIds.find(
    (roleId) =>
      findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: roleId,
        flatEntityMaps: flatRoleMaps,
      })?.isSystemSideEffect !== true,
  );
