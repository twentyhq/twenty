import { type FlatRoleTarget } from 'src/engine/metadata-modules/flat-role-target/types/flat-role-target.type';

export const FLAT_ROLE_TARGET_EDITABLE_PROPERTIES = [
  'roleId',
  'userWorkspaceId',
  'agentId',
  'apiKeyId',
] as const satisfies (keyof FlatRoleTarget)[];
