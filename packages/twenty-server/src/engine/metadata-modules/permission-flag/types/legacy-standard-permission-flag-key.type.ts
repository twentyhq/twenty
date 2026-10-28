import { type PERMISSION_FLAG_TYPE_BY_LEGACY_STANDARD_KEY } from 'src/engine/metadata-modules/permission-flag/constants/permission-flag-type-by-legacy-standard-key.constant';

export type LegacyStandardPermissionFlagKey =
  keyof typeof PERMISSION_FLAG_TYPE_BY_LEGACY_STANDARD_KEY;
