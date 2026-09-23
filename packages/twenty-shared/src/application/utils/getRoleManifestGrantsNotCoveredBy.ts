import { type RoleManifest } from '@/application/roleManifestType';
import {
  getEffectiveObjectPermissionsFromRoleManifest,
  OBJECT_PERMISSION_ACTIONS,
  type ObjectPermissionAction,
} from '@/application/utils/getEffectiveObjectPermissionsFromRoleManifest';
import { SystemPermissionFlag } from '@/constants/SystemPermissionFlag';
import { TOOL_PERMISSION_FLAGS } from '@/constants/ToolPermissionFlags';
import { isDefined } from '@/utils/validation/isDefined';

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

const stringifyWithSortedKeys = (value: unknown): string =>
  JSON.stringify(value, (_key, nestedValue) =>
    nestedValue !== null &&
    typeof nestedValue === 'object' &&
    !Array.isArray(nestedValue)
      ? Object.fromEntries(
          Object.entries(nestedValue as Record<string, unknown>).sort(
            ([leftKey], [rightKey]) => leftKey.localeCompare(rightKey),
          ),
        )
      : nestedValue,
  );

// Two row-level restrictions are only known to select the same rows when
// their predicates match exactly, including how their groups nest.
const getRowLevelRestrictionSignature = ({
  role,
  objectUniversalIdentifier,
}: {
  role: RoleManifest;
  objectUniversalIdentifier: string;
}): string[] => {
  const groupsByUniversalIdentifier = new Map(
    (role.rowLevelPermissionPredicateGroups ?? []).map((group) => [
      group.universalIdentifier,
      group,
    ]),
  );

  const getGroupPath = (
    groupUniversalIdentifier: string | null | undefined,
  ): string[] => {
    const path: string[] = [];
    const visited = new Set<string>();
    let current = groupUniversalIdentifier;

    while (isDefined(current) && !visited.has(current)) {
      visited.add(current);
      const group = groupsByUniversalIdentifier.get(current);

      if (!isDefined(group)) {
        break;
      }

      path.push(group.logicalOperator);
      current = group.parentPredicateGroupUniversalIdentifier;
    }

    return path;
  };

  return (role.rowLevelPermissionPredicates ?? [])
    .filter(
      (predicate) =>
        predicate.objectUniversalIdentifier === objectUniversalIdentifier,
    )
    .map((predicate) =>
      stringifyWithSortedKeys({
        fieldUniversalIdentifier: predicate.fieldUniversalIdentifier,
        subFieldName: predicate.subFieldName ?? null,
        operand: predicate.operand,
        value: predicate.value ?? null,
        workspaceMemberFieldUniversalIdentifier:
          predicate.workspaceMemberFieldUniversalIdentifier ?? null,
        workspaceMemberSubFieldName:
          predicate.workspaceMemberSubFieldName ?? null,
        groupPath: getGroupPath(predicate.predicateGroupUniversalIdentifier),
      }),
    )
    .sort();
};

const haveSameRowLevelRestriction = (
  roleSignature: string[],
  supersetSignature: string[],
): boolean =>
  roleSignature.length === supersetSignature.length &&
  roleSignature.every(
    (predicateSignature, index) =>
      predicateSignature === supersetSignature[index],
  );

// Lists what `role` may do that `superset` may not. An empty result means the
// superset covers the role. A superset row-level restriction is only treated
// as covered when the role carries the exact same one on that object, since
// two different predicate sets cannot be proven to select the same rows.
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
    const supersetRowLevelRestriction = getRowLevelRestrictionSignature({
      role: superset,
      objectUniversalIdentifier,
    });
    const roleRowLevelRestriction = getRowLevelRestrictionSignature({
      role,
      objectUniversalIdentifier,
    });

    if (
      roleReachesObject &&
      supersetRowLevelRestriction.length > 0 &&
      !haveSameRowLevelRestriction(
        roleRowLevelRestriction,
        supersetRowLevelRestriction,
      )
    ) {
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
