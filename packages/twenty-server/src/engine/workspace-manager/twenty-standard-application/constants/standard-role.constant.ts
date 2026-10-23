import { ADMIN_ROLE_UNIVERSAL_IDENTIFIER } from 'twenty-shared/constants';

export const STANDARD_ROLE = {
  admin: { universalIdentifier: ADMIN_ROLE_UNIVERSAL_IDENTIFIER },
} as const satisfies Record<string, { universalIdentifier: string }>;
