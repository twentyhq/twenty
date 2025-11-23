import { type FlatRoleTarget } from 'src/engine/metadata-modules/flat-role-target/types/flat-role-target.type';

export const ROLE_TARGET_FOREIGN_KEY_PROPERTIES = [
  'userWorkspaceId',
  'apiKeyId',
  'agentId',
] as const satisfies (keyof FlatRoleTarget)[];
