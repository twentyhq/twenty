import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';

export type DerivedCacheTriggers = {
  hasRolesPermissionsChanged: boolean;
  hasWorkflowVersionsChanged: boolean;
  hasApplicationVariablesChanged: boolean;
};

export const getDerivedCacheTriggers = (
  flatEntityMapsKeys: (keyof AllFlatEntityMaps)[],
): DerivedCacheTriggers => ({
  hasRolesPermissionsChanged: flatEntityMapsKeys.some(
    (flatEntityMapsKey) =>
      flatEntityMapsKey === 'flatRoleMaps' ||
      flatEntityMapsKey === 'flatRoleTargetMaps' ||
      flatEntityMapsKey === 'flatObjectPermissionMaps' ||
      flatEntityMapsKey === 'flatFieldPermissionMaps' ||
      flatEntityMapsKey === 'flatRolePermissionFlagMaps',
  ),
  hasWorkflowVersionsChanged: flatEntityMapsKeys.includes(
    'flatWorkflowVersionMaps',
  ),
  hasApplicationVariablesChanged: flatEntityMapsKeys.includes(
    'flatApplicationVariableMaps',
  ),
});
