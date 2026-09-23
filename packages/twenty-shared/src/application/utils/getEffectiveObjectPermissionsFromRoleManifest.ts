import { type RoleManifest } from '@/application/roleManifestType';

export const OBJECT_PERMISSION_ACTIONS = [
  'canReadObjectRecords',
  'canUpdateObjectRecords',
  'canSoftDeleteObjectRecords',
  'canDestroyObjectRecords',
] as const;

export type ObjectPermissionAction = (typeof OBJECT_PERMISSION_ACTIONS)[number];

export type EffectiveObjectPermissions = Record<
  ObjectPermissionAction,
  boolean
>;

export const ROLE_LEVEL_FLAG_BY_OBJECT_PERMISSION_ACTION = {
  canReadObjectRecords: 'canReadAllObjectRecords',
  canUpdateObjectRecords: 'canUpdateAllObjectRecords',
  canSoftDeleteObjectRecords: 'canSoftDeleteAllObjectRecords',
  canDestroyObjectRecords: 'canDestroyAllObjectRecords',
} as const satisfies Record<ObjectPermissionAction, keyof RoleManifest>;

export const getEffectiveObjectPermissionsFromRoleManifest = ({
  role,
  objectUniversalIdentifier,
}: {
  role: RoleManifest;
  objectUniversalIdentifier: string;
}): EffectiveObjectPermissions => {
  const objectPermission = role.objectPermissions?.find(
    (permission) =>
      permission.objectUniversalIdentifier === objectUniversalIdentifier,
  );

  return {
    canReadObjectRecords:
      objectPermission?.canReadObjectRecords ??
      role[ROLE_LEVEL_FLAG_BY_OBJECT_PERMISSION_ACTION.canReadObjectRecords] ??
      false,
    canUpdateObjectRecords:
      objectPermission?.canUpdateObjectRecords ??
      role[
        ROLE_LEVEL_FLAG_BY_OBJECT_PERMISSION_ACTION.canUpdateObjectRecords
      ] ??
      false,
    canSoftDeleteObjectRecords:
      objectPermission?.canSoftDeleteObjectRecords ??
      role[
        ROLE_LEVEL_FLAG_BY_OBJECT_PERMISSION_ACTION.canSoftDeleteObjectRecords
      ] ??
      false,
    canDestroyObjectRecords:
      objectPermission?.canDestroyObjectRecords ??
      role[
        ROLE_LEVEL_FLAG_BY_OBJECT_PERMISSION_ACTION.canDestroyObjectRecords
      ] ??
      false,
  };
};
