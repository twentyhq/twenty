import { type RoleManifest } from '@/application/roleManifestType';
import {
  getEffectiveObjectPermissionsFromRoleManifest,
  OBJECT_PERMISSION_ACTIONS,
  type ObjectPermissionAction,
} from '@/application/utils/getEffectiveObjectPermissionsFromRoleManifest';
import { SystemPermissionFlag } from '@/constants/SystemPermissionFlag';
import { TOOL_PERMISSION_FLAGS } from '@/constants/ToolPermissionFlags';

export type RoleManifestGrant =
  | {
      type: 'ALL_OBJECT_RECORDS';
      action: ObjectPermissionAction;
    }
  | {
      type: 'ALL_SETTINGS';
      flag: 'canUpdateAllSettings' | 'canAccessAllTools';
    }
  | {
      type: 'PERMISSION_FLAG';
      permissionFlagUniversalIdentifier: string;
    }
  | {
      type: 'OBJECT_RECORDS';
      objectUniversalIdentifier: string;
      action: ObjectPermissionAction;
    }
  | {
      type: 'FIELD_VALUE';
      objectUniversalIdentifier: string;
      fieldUniversalIdentifier: string;
      action: 'canReadFieldValue' | 'canUpdateFieldValue';
    }
  | {
      type: 'ROW_LEVEL_RESTRICTION';
      objectUniversalIdentifier: string;
    };

const ROLE_LEVEL_FLAG_BY_OBJECT_PERMISSION_ACTION = {
  canReadObjectRecords: 'canReadAllObjectRecords',
  canUpdateObjectRecords: 'canUpdateAllObjectRecords',
  canSoftDeleteObjectRecords: 'canSoftDeleteAllObjectRecords',
  canDestroyObjectRecords: 'canDestroyAllObjectRecords',
} as const satisfies Record<ObjectPermissionAction, keyof RoleManifest>;

const SYSTEM_TOOL_PERMISSION_FLAG_UNIVERSAL_IDENTIFIERS: readonly string[] =
  TOOL_PERMISSION_FLAGS.map((flag) => SystemPermissionFlag[flag]);

const getUniqueValues = (values: string[]): string[] => [...new Set(values)];

// Lists what `role` may do that `superset` may not. An empty result means the
// superset covers the role. Row-level predicates cannot be compared, so a
// superset predicate on an object the role reaches unrestricted is reported.
export const getRoleManifestGrantsNotCoveredBy = ({
  role,
  superset,
  toolPermissionFlagUniversalIdentifiers = [],
}: {
  role: RoleManifest;
  superset: RoleManifest;
  toolPermissionFlagUniversalIdentifiers?: string[];
}): RoleManifestGrant[] => {
  const grants: RoleManifestGrant[] = [];

  for (const action of OBJECT_PERMISSION_ACTIONS) {
    const roleLevelFlag = ROLE_LEVEL_FLAG_BY_OBJECT_PERMISSION_ACTION[action];

    if (role[roleLevelFlag] === true && superset[roleLevelFlag] !== true) {
      grants.push({ type: 'ALL_OBJECT_RECORDS', action });
    }
  }

  for (const flag of ['canUpdateAllSettings', 'canAccessAllTools'] as const) {
    if (role[flag] === true && superset[flag] !== true) {
      grants.push({ type: 'ALL_SETTINGS', flag });
    }
  }

  const toolFlagUniversalIdentifiers = new Set([
    ...SYSTEM_TOOL_PERMISSION_FLAG_UNIVERSAL_IDENTIFIERS,
    ...toolPermissionFlagUniversalIdentifiers,
  ]);
  const supersetFlagUniversalIdentifiers = new Set(
    superset.permissionFlagUniversalIdentifiers ?? [],
  );

  for (const permissionFlagUniversalIdentifier of getUniqueValues(
    role.permissionFlagUniversalIdentifiers ?? [],
  )) {
    const isCoveredByRoleLevelFlag = toolFlagUniversalIdentifiers.has(
      permissionFlagUniversalIdentifier,
    )
      ? superset.canAccessAllTools === true
      : superset.canUpdateAllSettings === true;

    if (
      !isCoveredByRoleLevelFlag &&
      !supersetFlagUniversalIdentifiers.has(permissionFlagUniversalIdentifier)
    ) {
      grants.push({
        type: 'PERMISSION_FLAG',
        permissionFlagUniversalIdentifier,
      });
    }
  }

  const objectUniversalIdentifiers = getUniqueValues(
    [...(role.objectPermissions ?? []), ...(superset.objectPermissions ?? [])]
      .map((permission) => permission.objectUniversalIdentifier)
      .concat(
        (superset.rowLevelPermissionPredicates ?? []).map(
          (predicate) => predicate.objectUniversalIdentifier,
        ),
      ),
  );

  for (const objectUniversalIdentifier of objectUniversalIdentifiers) {
    const roleEffectivePermissions =
      getEffectiveObjectPermissionsFromRoleManifest({
        role,
        objectUniversalIdentifier,
      });
    const supersetEffectivePermissions =
      getEffectiveObjectPermissionsFromRoleManifest({
        role: superset,
        objectUniversalIdentifier,
      });

    for (const action of OBJECT_PERMISSION_ACTIONS) {
      if (
        roleEffectivePermissions[action] &&
        !supersetEffectivePermissions[action]
      ) {
        grants.push({
          type: 'OBJECT_RECORDS',
          objectUniversalIdentifier,
          action,
        });
      }
    }

    const roleReachesObject = OBJECT_PERMISSION_ACTIONS.some(
      (action) => roleEffectivePermissions[action],
    );
    const supersetRestrictsRows = (
      superset.rowLevelPermissionPredicates ?? []
    ).some(
      (predicate) =>
        predicate.objectUniversalIdentifier === objectUniversalIdentifier,
    );
    const roleRestrictsRows = (role.rowLevelPermissionPredicates ?? []).some(
      (predicate) =>
        predicate.objectUniversalIdentifier === objectUniversalIdentifier,
    );

    if (roleReachesObject && supersetRestrictsRows && !roleRestrictsRows) {
      grants.push({
        type: 'ROW_LEVEL_RESTRICTION',
        objectUniversalIdentifier,
      });
    }
  }

  for (const supersetFieldPermission of superset.fieldPermissions ?? []) {
    const { objectUniversalIdentifier, fieldUniversalIdentifier } =
      supersetFieldPermission;
    const roleEffectivePermissions =
      getEffectiveObjectPermissionsFromRoleManifest({
        role,
        objectUniversalIdentifier,
      });
    const roleFieldPermission = role.fieldPermissions?.find(
      (permission) =>
        permission.objectUniversalIdentifier === objectUniversalIdentifier &&
        permission.fieldUniversalIdentifier === fieldUniversalIdentifier,
    );

    if (
      supersetFieldPermission.canReadFieldValue === false &&
      roleEffectivePermissions.canReadObjectRecords &&
      roleFieldPermission?.canReadFieldValue !== false
    ) {
      grants.push({
        type: 'FIELD_VALUE',
        objectUniversalIdentifier,
        fieldUniversalIdentifier,
        action: 'canReadFieldValue',
      });
    }

    if (
      supersetFieldPermission.canUpdateFieldValue === false &&
      roleEffectivePermissions.canUpdateObjectRecords &&
      roleFieldPermission?.canUpdateFieldValue !== false
    ) {
      grants.push({
        type: 'FIELD_VALUE',
        objectUniversalIdentifier,
        fieldUniversalIdentifier,
        action: 'canUpdateFieldValue',
      });
    }
  }

  return grants;
};
