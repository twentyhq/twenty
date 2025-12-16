import { ADMIN_ROLE } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-roles/roles/admin-role';

export const STANDARD_ROLE = {
  admin: { universalIdentifier: ADMIN_ROLE.standardId },
} as const satisfies Record<string, { universalIdentifier: string }>;
