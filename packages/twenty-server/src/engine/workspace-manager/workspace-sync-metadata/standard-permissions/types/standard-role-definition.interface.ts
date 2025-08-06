import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';

export type StandardRoleDefinition = Omit<
  RoleEntity,
  | 'id'
  | 'workspaceId'
  | 'createdAt'
  | 'updatedAt'
  | 'permissionFlags'
  | 'roleTargets'
  | 'objectPermissions'
  | 'fieldPermissions'
>;
