import { type RoleIdsBySource } from 'src/engine/twenty-orm/types/role-permission-config.type';

// Key order must stay stable: the intersection keeps the first role's row-level predicates
export const ROLE_SOURCES_IN_INTERSECTION_ORDER = Object.keys({
  agentRoleId: true,
  userWorkspaceRoleId: true,
  apiKeyRoleId: true,
  applicationRoleId: true,
} satisfies Record<keyof RoleIdsBySource, true>) as (keyof RoleIdsBySource)[];
