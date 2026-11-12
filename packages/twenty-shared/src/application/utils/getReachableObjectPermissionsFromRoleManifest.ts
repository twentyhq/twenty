import { type NormalizedRoleManifest } from '@/application/roleManifestType';
import {
  type EffectiveObjectPermissions,
  getEffectiveObjectPermissionsFromRoleManifest,
} from '@/application/utils/getEffectiveObjectPermissionsFromRoleManifest';
import { getRecordsPermissionsFromRoleManifest } from '@/application/utils/getRecordsPermissionsFromRoleManifest';

export const getReachableObjectPermissionsFromRoleManifest = ({
  role,
  objectUniversalIdentifier,
}: {
  role: NormalizedRoleManifest;
  objectUniversalIdentifier: string;
}): EffectiveObjectPermissions => {
  const recordsPermissions = getRecordsPermissionsFromRoleManifest({ role });
  const allRecordsPermissions = getEffectiveObjectPermissionsFromRoleManifest({
    role: recordsPermissions,
    objectUniversalIdentifier,
  });
  const rules = recordsPermissions.rowLevelPermissionRules.filter(
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
