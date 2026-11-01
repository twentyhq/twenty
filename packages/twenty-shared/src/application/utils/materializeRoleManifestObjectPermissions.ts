import { type RoleManifest } from '@/application/roleManifestType';
import { getEffectiveObjectPermissionsFromRoleManifest } from '@/application/utils/getEffectiveObjectPermissionsFromRoleManifest';

// Resolves each named object row against the role-level switches, so the row stands on its own
export const materializeRoleManifestObjectPermissions = (
  roleManifest: RoleManifest,
): RoleManifest => ({
  ...roleManifest,
  objectPermissions: (roleManifest.objectPermissions ?? []).map(
    (objectPermission) => ({
      objectUniversalIdentifier: objectPermission.objectUniversalIdentifier,
      ...getEffectiveObjectPermissionsFromRoleManifest({
        role: roleManifest,
        objectUniversalIdentifier: objectPermission.objectUniversalIdentifier,
      }),
    }),
  ),
});
