import {
  type FieldPermissionManifest,
  type ObjectPermissionManifest,
  type RoleManifest,
} from '@/application/roleManifestType';
import { getEffectiveObjectPermissionsFromRoleManifest } from '@/application/utils/getEffectiveObjectPermissionsFromRoleManifest';
import { isDefined } from '@/utils/validation/isDefined';

const getUniqueValues = (values: string[]): string[] => [...new Set(values)];

const computeObjectPermissionsUnion = (
  roles: RoleManifest[],
): ObjectPermissionManifest[] => {
  const objectUniversalIdentifiers = getUniqueValues(
    roles.flatMap((role) =>
      (role.objectPermissions ?? []).map(
        (permission) => permission.objectUniversalIdentifier,
      ),
    ),
  );

  return objectUniversalIdentifiers.map((objectUniversalIdentifier) => {
    const effectivePermissionsPerRole = roles.map((role) =>
      getEffectiveObjectPermissionsFromRoleManifest({
        role,
        objectUniversalIdentifier,
      }),
    );

    const firstDeclaredPermission = roles
      .flatMap((role) => role.objectPermissions ?? [])
      .find(
        (permission) =>
          permission.objectUniversalIdentifier === objectUniversalIdentifier,
      );

    return {
      ...(isDefined(firstDeclaredPermission?.universalIdentifier)
        ? { universalIdentifier: firstDeclaredPermission.universalIdentifier }
        : {}),
      objectUniversalIdentifier,
      canReadObjectRecords: effectivePermissionsPerRole.some(
        (permissions) => permissions.canReadObjectRecords,
      ),
      canUpdateObjectRecords: effectivePermissionsPerRole.some(
        (permissions) => permissions.canUpdateObjectRecords,
      ),
      canSoftDeleteObjectRecords: effectivePermissionsPerRole.some(
        (permissions) => permissions.canSoftDeleteObjectRecords,
      ),
      canDestroyObjectRecords: effectivePermissionsPerRole.some(
        (permissions) => permissions.canDestroyObjectRecords,
      ),
    };
  });
};

// A field restriction only survives the union when every role that can reach
// the object applies it; a role that cannot reach the object has no say.
const computeFieldPermissionsUnion = (
  roles: RoleManifest[],
): FieldPermissionManifest[] => {
  const declaredFieldPermissions = roles.flatMap(
    (role) => role.fieldPermissions ?? [],
  );

  const fieldKeys = getUniqueValues(
    declaredFieldPermissions.map(
      (permission) =>
        `${permission.objectUniversalIdentifier}:${permission.fieldUniversalIdentifier}`,
    ),
  );

  return fieldKeys.flatMap((fieldKey) => {
    const firstDeclaredPermission = declaredFieldPermissions.find(
      (permission) =>
        `${permission.objectUniversalIdentifier}:${permission.fieldUniversalIdentifier}` ===
        fieldKey,
    );

    if (!isDefined(firstDeclaredPermission)) {
      return [];
    }

    const { objectUniversalIdentifier, fieldUniversalIdentifier } =
      firstDeclaredPermission;

    const findRoleFieldPermission = (role: RoleManifest) =>
      role.fieldPermissions?.find(
        (permission) =>
          permission.objectUniversalIdentifier === objectUniversalIdentifier &&
          permission.fieldUniversalIdentifier === fieldUniversalIdentifier,
      );

    const rolesAbleToRead = roles.filter(
      (role) =>
        getEffectiveObjectPermissionsFromRoleManifest({
          role,
          objectUniversalIdentifier,
        }).canReadObjectRecords,
    );
    const rolesAbleToUpdate = roles.filter(
      (role) =>
        getEffectiveObjectPermissionsFromRoleManifest({
          role,
          objectUniversalIdentifier,
        }).canUpdateObjectRecords,
    );

    const isReadRestricted =
      rolesAbleToRead.length > 0 &&
      rolesAbleToRead.every(
        (role) => findRoleFieldPermission(role)?.canReadFieldValue === false,
      );
    const isUpdateRestricted =
      rolesAbleToUpdate.length > 0 &&
      rolesAbleToUpdate.every(
        (role) => findRoleFieldPermission(role)?.canUpdateFieldValue === false,
      );

    if (!isReadRestricted && !isUpdateRestricted) {
      return [];
    }

    return [
      {
        ...(isDefined(firstDeclaredPermission.universalIdentifier)
          ? { universalIdentifier: firstDeclaredPermission.universalIdentifier }
          : {}),
        objectUniversalIdentifier,
        fieldUniversalIdentifier,
        ...(isReadRestricted ? { canReadFieldValue: false } : {}),
        ...(isUpdateRestricted ? { canUpdateFieldValue: false } : {}),
      },
    ];
  });
};

// Row-level predicates only narrow a role, so a union of a narrowed and an
// unnarrowed role is unnarrowed; the result carries none.
export const computeRoleManifestUnion = ({
  baseRole,
  roles,
}: {
  baseRole: RoleManifest;
  roles: RoleManifest[];
}): RoleManifest => {
  const allRoles = [baseRole, ...roles];

  const someRoleHas = (
    flag:
      | 'canUpdateAllSettings'
      | 'canAccessAllTools'
      | 'canReadAllObjectRecords'
      | 'canUpdateAllObjectRecords'
      | 'canSoftDeleteAllObjectRecords'
      | 'canDestroyAllObjectRecords'
      | 'canBeAssignedToUsers'
      | 'canBeAssignedToAgents'
      | 'canBeAssignedToApiKeys',
  ) => allRoles.some((role) => role[flag]);

  return {
    ...baseRole,
    canUpdateAllSettings: someRoleHas('canUpdateAllSettings'),
    canAccessAllTools: someRoleHas('canAccessAllTools'),
    canReadAllObjectRecords: someRoleHas('canReadAllObjectRecords'),
    canUpdateAllObjectRecords: someRoleHas('canUpdateAllObjectRecords'),
    canSoftDeleteAllObjectRecords: someRoleHas('canSoftDeleteAllObjectRecords'),
    canDestroyAllObjectRecords: someRoleHas('canDestroyAllObjectRecords'),
    canBeAssignedToUsers: someRoleHas('canBeAssignedToUsers'),
    canBeAssignedToAgents: someRoleHas('canBeAssignedToAgents'),
    canBeAssignedToApiKeys: someRoleHas('canBeAssignedToApiKeys'),
    objectPermissions: computeObjectPermissionsUnion(allRoles),
    fieldPermissions: computeFieldPermissionsUnion(allRoles),
    rowLevelPermissionPredicates: [],
    rowLevelPermissionPredicateGroups: [],
    permissionFlagUniversalIdentifiers: getUniqueValues(
      allRoles.flatMap((role) => role.permissionFlagUniversalIdentifiers ?? []),
    ),
  };
};
