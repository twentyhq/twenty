import {
  PermissionFlagType,
  SystemPermissionFlag,
} from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { hasRoleWideAccessToPermissionFlag } from 'src/engine/metadata-modules/permissions/utils/has-role-wide-access-to-permission-flag.util';
import { IMPLICIT_OBJECT_PERMISSION_RULES } from 'src/engine/metadata-modules/role/constants/implicit-object-permission-rules.constant';
import { type ComputeObjectRecordPermissionsArgs } from 'src/engine/metadata-modules/role/types/compute-object-record-permissions-args.type';
import { type ObjectRecordPermissions } from 'src/engine/metadata-modules/role/types/object-record-permissions.type';
import { type SettingsGatedObjectPermissionRule } from 'src/engine/metadata-modules/role/types/settings-gated-object-permission-rule.type';

const isPermissionFlagGranted = ({
  role,
  rolePermissionFlagUniversalIdentifiers,
  permissionFlag,
}: Pick<
  ComputeObjectRecordPermissionsArgs,
  'role' | 'rolePermissionFlagUniversalIdentifiers'
> & {
  permissionFlag: PermissionFlagType;
}): boolean =>
  hasRoleWideAccessToPermissionFlag({ role, permissionFlag }) ||
  rolePermissionFlagUniversalIdentifiers.has(
    SystemPermissionFlag[permissionFlag],
  );

const computeSettingsGatedObjectRecordPermissions = ({
  role,
  rolePermissionFlagUniversalIdentifiers,
  settingsGatedObjectPermissionRule,
}: Pick<
  ComputeObjectRecordPermissionsArgs,
  'role' | 'rolePermissionFlagUniversalIdentifiers'
> & {
  settingsGatedObjectPermissionRule: SettingsGatedObjectPermissionRule;
}): ObjectRecordPermissions => {
  const hasSettingsPermission = isPermissionFlagGranted({
    role,
    rolePermissionFlagUniversalIdentifiers,
    permissionFlag: settingsGatedObjectPermissionRule.permissionFlag,
  });

  return {
    canReadObjectRecords:
      settingsGatedObjectPermissionRule.isAlwaysReadable ||
      hasSettingsPermission,
    canUpdateObjectRecords: hasSettingsPermission,
    canSoftDeleteObjectRecords: hasSettingsPermission,
    canDestroyObjectRecords: hasSettingsPermission,
  };
};

const computeOverridableObjectRecordPermissions = ({
  role,
  objectMetadata,
  objectPermissionOverride,
}: Pick<
  ComputeObjectRecordPermissionsArgs,
  'role' | 'objectMetadata' | 'objectPermissionOverride'
>): ObjectRecordPermissions => {
  const resolvePermission = (
    overrideValue: boolean | null | undefined,
    roleValue: boolean,
  ) =>
    overrideValue ??
    (objectMetadata.isSystem
      ? IMPLICIT_OBJECT_PERMISSION_RULES.systemObjectDefaultRecordPermission
      : roleValue);

  return {
    canReadObjectRecords: resolvePermission(
      objectPermissionOverride?.canReadObjectRecords,
      role.canReadAllObjectRecords,
    ),
    canUpdateObjectRecords: resolvePermission(
      objectPermissionOverride?.canUpdateObjectRecords,
      role.canUpdateAllObjectRecords,
    ),
    canSoftDeleteObjectRecords: resolvePermission(
      objectPermissionOverride?.canSoftDeleteObjectRecords,
      role.canSoftDeleteAllObjectRecords,
    ),
    canDestroyObjectRecords: resolvePermission(
      objectPermissionOverride?.canDestroyObjectRecords,
      role.canDestroyAllObjectRecords,
    ),
  };
};

const restrictToAiAccess = ({
  objectRecordPermissions,
  role,
  rolePermissionFlagUniversalIdentifiers,
}: Pick<
  ComputeObjectRecordPermissionsArgs,
  'role' | 'rolePermissionFlagUniversalIdentifiers'
> & {
  objectRecordPermissions: ObjectRecordPermissions;
}): ObjectRecordPermissions => {
  const hasAiAccess = isPermissionFlagGranted({
    role,
    rolePermissionFlagUniversalIdentifiers,
    permissionFlag: PermissionFlagType.AI,
  });

  return {
    canReadObjectRecords:
      objectRecordPermissions.canReadObjectRecords && hasAiAccess,
    canUpdateObjectRecords:
      objectRecordPermissions.canUpdateObjectRecords && hasAiAccess,
    canSoftDeleteObjectRecords:
      objectRecordPermissions.canSoftDeleteObjectRecords && hasAiAccess,
    canDestroyObjectRecords:
      objectRecordPermissions.canDestroyObjectRecords && hasAiAccess,
  };
};

export const computeObjectRecordPermissions = ({
  role,
  rolePermissionFlagUniversalIdentifiers,
  objectMetadata,
  objectPermissionOverride,
}: ComputeObjectRecordPermissionsArgs): {
  objectRecordPermissions: ObjectRecordPermissions;
  appliesFieldPermissions: boolean;
} => {
  const settingsGatedObjectPermissionRule =
    IMPLICIT_OBJECT_PERMISSION_RULES
      .settingsGatedObjectRuleByUniversalIdentifier[
      objectMetadata.universalIdentifier
    ];

  const objectRecordPermissions = isDefined(settingsGatedObjectPermissionRule)
    ? computeSettingsGatedObjectRecordPermissions({
        role,
        rolePermissionFlagUniversalIdentifiers,
        settingsGatedObjectPermissionRule,
      })
    : computeOverridableObjectRecordPermissions({
        role,
        objectMetadata,
        objectPermissionOverride,
      });

  const isAiGatedObject =
    IMPLICIT_OBJECT_PERMISSION_RULES.aiGatedObjectUniversalIdentifiers.includes(
      objectMetadata.universalIdentifier,
    );

  return {
    objectRecordPermissions: isAiGatedObject
      ? restrictToAiAccess({
          objectRecordPermissions,
          role,
          rolePermissionFlagUniversalIdentifiers,
        })
      : objectRecordPermissions,
    appliesFieldPermissions:
      settingsGatedObjectPermissionRule?.appliesFieldPermissions ?? true,
  };
};
