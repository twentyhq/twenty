import {
  LEGACY_ROLE_RECORDS_PERMISSIONS_MANIFEST_KEYS,
  type LegacyCompliantRoleManifest,
} from '@/application/roleManifestType';
import { isDefined } from '@/utils/validation/isDefined';

type LegacyRoleRecordsPermissionsManifestKey =
  (typeof LEGACY_ROLE_RECORDS_PERMISSIONS_MANIFEST_KEYS)[number];

// An empty array counts as not declared: older CLI builds always write the legacy arrays
export const getDeclaredLegacyRoleRecordsPermissionsKeys = ({
  role,
}: {
  role: Pick<
    LegacyCompliantRoleManifest,
    LegacyRoleRecordsPermissionsManifestKey
  >;
}): LegacyRoleRecordsPermissionsManifestKey[] =>
  LEGACY_ROLE_RECORDS_PERMISSIONS_MANIFEST_KEYS.filter((key) => {
    const value = role[key];

    return Array.isArray(value) ? value.length > 0 : isDefined(value);
  });
