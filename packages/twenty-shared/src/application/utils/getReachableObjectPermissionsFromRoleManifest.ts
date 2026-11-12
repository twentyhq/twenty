import { type RoleManifest } from '@/application/roleManifestType';
import {
  type EffectiveObjectPermissions,
  getEffectiveObjectPermissionsFromRoleManifest,
} from '@/application/utils/getEffectiveObjectPermissionsFromRoleManifest';

// An operation reaches an object through an all-records grant or through a row level permission rule
export const getReachableObjectPermissionsFromRoleManifest = ({
  role,
  objectUniversalIdentifier,
}: {
  role: RoleManifest;
  objectUniversalIdentifier: string;
}): EffectiveObjectPermissions => {
  const allRecordsPermissions = getEffectiveObjectPermissionsFromRoleManifest({
    role,
    objectUniversalIdentifier,
  });
  const rules = (role.rowLevelPermissionRules ?? []).filter(
    (rule) => rule.objectUniversalIdentifier === objectUniversalIdentifier,
  );

  return {
    canReadObjectRecords:
      allRecordsPermissions.canReadObjectRecords ||
      rules.some((rule) => rule.canReadRecords ?? false),
    canUpdateObjectRecords:
      allRecordsPermissions.canUpdateObjectRecords ||
      rules.some((rule) => rule.canUpdateRecords ?? false),
    canSoftDeleteObjectRecords:
      allRecordsPermissions.canSoftDeleteObjectRecords ||
      rules.some((rule) => rule.canSoftDeleteRecords ?? false),
    canDestroyObjectRecords:
      allRecordsPermissions.canDestroyObjectRecords ||
      rules.some((rule) => rule.canDestroyRecords ?? false),
  };
};
