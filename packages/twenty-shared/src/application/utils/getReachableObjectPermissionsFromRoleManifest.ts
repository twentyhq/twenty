import { type RoleManifest } from '@/application/roleManifestType';
import {
  type EffectiveObjectPermissions,
  getEffectiveObjectPermissionsFromRoleManifest,
} from '@/application/utils/getEffectiveObjectPermissionsFromRoleManifest';
import { getRecordsPermissionsFromRoleManifest } from '@/application/utils/getRecordsPermissionsFromRoleManifest';

export const getReachableObjectPermissionsFromRoleManifest = ({
  role,
  objectUniversalIdentifier,
}: {
  role: RoleManifest;
  objectUniversalIdentifier: string;
}): EffectiveObjectPermissions => {
  const { objectPermissions, rowLevelPermissionRules } =
    getRecordsPermissionsFromRoleManifest({ role });
  const allRecordsPermissions = getEffectiveObjectPermissionsFromRoleManifest({
    role: { ...role, objectPermissions },
    objectUniversalIdentifier,
  });
  const rules = rowLevelPermissionRules.filter(
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
