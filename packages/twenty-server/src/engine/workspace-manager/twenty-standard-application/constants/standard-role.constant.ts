import { ADMIN_ROLE } from 'src/engine/metadata-modules/role/constants/admin-role';

export const STANDARD_ROLE = {
  admin: { universalIdentifier: ADMIN_ROLE.standardId },
} as const satisfies Record<string, { universalIdentifier: string }>;
