import { LEGACY_ROLE_RECORDS_PERMISSIONS_MANIFEST_KEYS } from '@/application/roleManifestType';
import { isDefined } from '@/utils/validation/isDefined';

type LegacyRoleRecordsPermissionsManifestKey =
  (typeof LEGACY_ROLE_RECORDS_PERMISSIONS_MANIFEST_KEYS)[number];

// An empty array counts as not declared: older CLI builds always write the legacy arrays
export const getDeclaredLegacyRoleRecordsPermissionsKeys = ({
  role,
}: {
  // Only presence is read, so the SDK role config with its looser enum values fits too
  role: {
    [Key in LegacyRoleRecordsPermissionsManifestKey]?: boolean | unknown[];
  };
}): LegacyRoleRecordsPermissionsManifestKey[] =>
  LEGACY_ROLE_RECORDS_PERMISSIONS_MANIFEST_KEYS.filter((key) => {
    const value = role[key];

    return Array.isArray(value) ? value.length > 0 : isDefined(value);
  });
