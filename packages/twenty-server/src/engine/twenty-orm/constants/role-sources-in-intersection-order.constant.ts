import { type RoleIdsBySource } from 'src/engine/twenty-orm/types/role-permission-config.type';

// Keyed by every source so none can be left out. The key order is the intersection order,
// which must stay stable because the intersection keeps the first role's row-level predicates
export const ROLE_SOURCES_IN_INTERSECTION_ORDER = Object.keys({
  agentRoleId: true,
  userWorkspaceRoleId: true,
  apiKeyRoleId: true,
  applicationRoleId: true,
} satisfies Record<keyof RoleIdsBySource, true>) as (keyof RoleIdsBySource)[];
