import { OBJECT_PERMISSION_ACTIONS } from '@/application/objectPermissionActionType';
import { type RoleManifestGrant } from '@/application/roleManifestGrantType';
import { type RoleManifest } from '@/application/roleManifestType';
import {
  getEffectiveObjectPermissionsFromRoleManifest,
  ROLE_LEVEL_FLAG_BY_OBJECT_PERMISSION_ACTION,
} from '@/application/utils/getEffectiveObjectPermissionsFromRoleManifest';
import { getRowLevelRestrictionSignature } from '@/application/utils/getRowLevelRestrictionSignature';
import { SystemPermissionFlag } from '@/constants/SystemPermissionFlag';
import { TOOL_PERMISSION_FLAGS } from '@/constants/ToolPermissionFlags';

const SYSTEM_TOOL_PERMISSION_FLAG_UNIVERSAL_IDENTIFIERS =
  TOOL_PERMISSION_FLAGS.map((flag) => SystemPermissionFlag[flag]);

const haveSameRowLevelRestriction = ({
  roleSignature,
  supersetSignature,
}: {
  roleSignature: string[];
  supersetSignature: string[];
}): boolean =>
  roleSignature.length === supersetSignature.length &&
  roleSignature.every(
    (predicateSignature, index) =>
      predicateSignature === supersetSignature[index],
  );

const getRoleLevelGrantsNotCoveredBy = ({
  role,
  superset,
}: {
  role: RoleManifest;
  superset: RoleManifest;
}): RoleManifestGrant[] => [
  ...OBJECT_PERMISSION_ACTIONS.filter((action) => {
    const roleLevelFlag = ROLE_LEVEL_FLAG_BY_OBJECT_PERMISSION_ACTION[action];

    return role[roleLevelFlag] && !superset[roleLevelFlag];
  }).map<RoleManifestGrant>((action) => ({
    type: 'ALL_OBJECT_RECORDS',
    action,
  })),
  ...(role.canUpdateAllSettings && !superset.canUpdateAllSettings
    ? [{ type: 'ALL_SETTINGS' } as const]
    : []),
  ...(role.canAccessAllTools && !superset.canAccessAllTools
    ? [{ type: 'ALL_TOOLS' } as const]
    : []),
];

// A tool flag is covered by canAccessAllTools and a settings flag by
// canUpdateAllSettings, the same way the server resolves them at runtime.
const getPermissionFlagGrantsNotCoveredBy = ({
  role,
  superset,
  toolPermissionFlagUniversalIdentifiers,
}: {
  role: RoleManifest;
  superset: RoleManifest;
  toolPermissionFlagUniversalIdentifiers: string[];
}): RoleManifestGrant[] => {
  const toolFlagUniversalIdentifiers = new Set([
    ...SYSTEM_TOOL_PERMISSION_FLAG_UNIVERSAL_IDENTIFIERS,
    ...toolPermissionFlagUniversalIdentifiers,
  ]);
  const supersetFlagUniversalIdentifiers = new Set(
    superset.permissionFlagUniversalIdentifiers ?? [],
  );

  return [...new Set(role.permissionFlagUniversalIdentifiers ?? [])]
    .filter((permissionFlagUniversalIdentifier) => {
      const isCoveredByRoleLevelFlag = toolFlagUniversalIdentifiers.has(
        permissionFlagUniversalIdentifier,
      )
        ? superset.canAccessAllTools
        : superset.canUpdateAllSettings;

      return (
        !isCoveredByRoleLevelFlag &&
        !supersetFlagUniversalIdentifiers.has(permissionFlagUniversalIdentifier)
      );
    })
    .map((permissionFlagUniversalIdentifier) => ({
      type: 'PERMISSION_FLAG',
      permissionFlagUniversalIdentifier,
    }));
};

// A superset row-level restriction is only treated as covered when the role
// carries the exact same one on that object, since two different predicate
// sets cannot be proven to select the same rows.
const getObjectGrantsNotCoveredBy = ({
  role,
  superset,
}: {
  role: RoleManifest;
  superset: RoleManifest;
}): RoleManifestGrant[] => {
  const objectUniversalIdentifiers = new Set([
    ...[
      ...(role.objectPermissions ?? []),
      ...(superset.objectPermissions ?? []),
    ].map((permission) => permission.objectUniversalIdentifier),
    ...(superset.rowLevelPermissionPredicates ?? []).map(
      (predicate) => predicate.objectUniversalIdentifier,
    ),
  ]);

  return [...objectUniversalIdentifiers].flatMap(
    (objectUniversalIdentifier): RoleManifestGrant[] => {
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

      const objectRecordGrants = OBJECT_PERMISSION_ACTIONS.filter(
        (action) =>
          roleEffectivePermissions[action] &&
          !supersetEffectivePermissions[action],
      ).map<RoleManifestGrant>((action) => ({
        type: 'OBJECT_RECORDS',
        objectUniversalIdentifier,
        action,
      }));

      const roleReachesObject = OBJECT_PERMISSION_ACTIONS.some(
        (action) => roleEffectivePermissions[action],
      );
      const supersetSignature = getRowLevelRestrictionSignature({
        role: superset,
        objectUniversalIdentifier,
      });
      const roleSignature = getRowLevelRestrictionSignature({
        role,
        objectUniversalIdentifier,
      });

      const escapesRowLevelRestriction =
        roleReachesObject &&
        supersetSignature.length > 0 &&
        !haveSameRowLevelRestriction({ roleSignature, supersetSignature });

      return escapesRowLevelRestriction
        ? [
            ...objectRecordGrants,
            { type: 'ROW_LEVEL_RESTRICTION', objectUniversalIdentifier },
          ]
        : objectRecordGrants;
    },
  );
};

const getFieldGrantsNotCoveredBy = ({
  role,
  superset,
}: {
  role: RoleManifest;
  superset: RoleManifest;
}): RoleManifestGrant[] =>
  (superset.fieldPermissions ?? []).flatMap(
    (supersetFieldPermission): RoleManifestGrant[] => {
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

      const escapesReadRestriction =
        supersetFieldPermission.canReadFieldValue === false &&
        roleEffectivePermissions.canReadObjectRecords &&
        roleFieldPermission?.canReadFieldValue !== false;
      const escapesUpdateRestriction =
        supersetFieldPermission.canUpdateFieldValue === false &&
        roleEffectivePermissions.canUpdateObjectRecords &&
        roleFieldPermission?.canUpdateFieldValue !== false;

      return [
        ...(escapesReadRestriction
          ? ([
              {
                type: 'FIELD_VALUE',
                objectUniversalIdentifier,
                fieldUniversalIdentifier,
                action: 'canReadFieldValue',
              },
            ] as const)
          : []),
        ...(escapesUpdateRestriction
          ? ([
              {
                type: 'FIELD_VALUE',
                objectUniversalIdentifier,
                fieldUniversalIdentifier,
                action: 'canUpdateFieldValue',
              },
            ] as const)
          : []),
      ];
    },
  );

// Lists what `role` may do that `superset` may not. An empty result means the
// superset covers the role.
export const getRoleManifestGrantsNotCoveredBy = ({
  role,
  superset,
  toolPermissionFlagUniversalIdentifiers,
}: {
  role: RoleManifest;
  superset: RoleManifest;
  toolPermissionFlagUniversalIdentifiers: string[];
}): RoleManifestGrant[] => [
  ...getRoleLevelGrantsNotCoveredBy({ role, superset }),
  ...getPermissionFlagGrantsNotCoveredBy({
    role,
    superset,
    toolPermissionFlagUniversalIdentifiers,
  }),
  ...getObjectGrantsNotCoveredBy({ role, superset }),
  ...getFieldGrantsNotCoveredBy({ role, superset }),
];
