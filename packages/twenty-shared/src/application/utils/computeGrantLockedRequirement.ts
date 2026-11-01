import { OBJECT_PERMISSION_ACTIONS } from '@/application/objectPermissionActionType';
import { type RoleManifest } from '@/application/roleManifestType';
import { ROLE_LEVEL_FLAG_BY_OBJECT_PERMISSION_ACTION } from '@/application/utils/getEffectiveObjectPermissionsFromRoleManifest';
import { type RoleManifestGrant } from '@/application/roleManifestGrantType';
import { getRoleManifestGrantsNotCoveredBy } from '@/application/utils/getRoleManifestGrantsNotCoveredBy';
import { materializeRoleManifestObjectPermissions } from '@/application/utils/materializeRoleManifestObjectPermissions';

// The minimum a grant must keep: the approved request, minus the "all objects" switches whose scope the admin decides
export const computeGrantLockedRequirement = (
  approvedRoleManifest: RoleManifest,
): RoleManifest => ({
  ...materializeRoleManifestObjectPermissions(approvedRoleManifest),
  ...Object.fromEntries(
    OBJECT_PERMISSION_ACTIONS.map((action) => [
      ROLE_LEVEL_FLAG_BY_OBJECT_PERMISSION_ACTION[action],
      false,
    ]),
  ),
  fieldPermissions: [],
  rowLevelPermissionPredicates: [],
  rowLevelPermissionPredicateGroups: [],
});

export const computeGrantMissingLockedPermissions = ({
  approvedRoleManifest,
  grantRoleManifest,
}: {
  approvedRoleManifest: RoleManifest;
  grantRoleManifest: RoleManifest;
}): RoleManifestGrant[] =>
  getRoleManifestGrantsNotCoveredBy({
    role: computeGrantLockedRequirement(approvedRoleManifest),
    superset: {
      ...grantRoleManifest,
      fieldPermissions: [],
      rowLevelPermissionPredicates: [],
      rowLevelPermissionPredicateGroups: [],
    },
    toolPermissionFlagUniversalIdentifiers: [],
  });
