import {
  PermissionFlagType,
  SystemPermissionFlag,
} from 'twenty-shared/constants';
import { type ObjectPermissions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type ObjectPermissionEntity } from 'src/engine/metadata-modules/object-permission/object-permission.entity';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import {
  IMPLICIT_OBJECT_PERMISSION_RULES,
  type SettingsGatedObjectPermissionRule,
} from 'src/engine/metadata-modules/role/constants/implicit-object-permission-rules.constant';
import { type RoleEntity } from 'src/engine/metadata-modules/role/role.entity';

export type ObjectRecordPermissions = Pick<
  ObjectPermissions,
  | 'canReadObjectRecords'
  | 'canUpdateObjectRecords'
  | 'canSoftDeleteObjectRecords'
  | 'canDestroyObjectRecords'
>;

export type ComputeObjectRecordPermissionsArgs = {
  role: Pick<
    RoleEntity,
    | 'canReadAllObjectRecords'
    | 'canUpdateAllObjectRecords'
    | 'canSoftDeleteAllObjectRecords'
    | 'canDestroyAllObjectRecords'
    | 'canUpdateAllSettings'
    | 'canAccessAllTools'
  >;
  rolePermissionFlagUniversalIdentifiers: ReadonlySet<string>;
  objectMetadata: Pick<
    ObjectMetadataEntity,
    'isSystem' | 'universalIdentifier'
  >;
  objectPermissionOverride?: Pick<
    ObjectPermissionEntity,
    | 'canReadObjectRecords'
    | 'canUpdateObjectRecords'
    | 'canSoftDeleteObjectRecords'
    | 'canDestroyObjectRecords'
  >;
};

export type ComputedObjectRecordPermissions = {
  objectRecordPermissions: ObjectRecordPermissions;
  appliesFieldPermissions: boolean;
};

const hasPermissionFlag = (
  rolePermissionFlagUniversalIdentifiers: ReadonlySet<string>,
  permissionFlag: PermissionFlagType,
): boolean =>
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
  const hasSettingsPermission =
    role.canUpdateAllSettings ||
    hasPermissionFlag(
      rolePermissionFlagUniversalIdentifiers,
      settingsGatedObjectPermissionRule.permissionFlag,
    );

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
  const hasAiAccess =
    role.canAccessAllTools ||
    hasPermissionFlag(
      rolePermissionFlagUniversalIdentifiers,
      PermissionFlagType.AI,
    );

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
}: ComputeObjectRecordPermissionsArgs): ComputedObjectRecordPermissions => {
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
