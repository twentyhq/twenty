import { type RolePermissionFlagEntity } from 'src/engine/metadata-modules/role-permission-flag/role-permission-flag.entity';
import { type UniversalFlatEntityFrom } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-from.type';

export type UniversalFlatRolePermissionFlag = UniversalFlatEntityFrom<
  RolePermissionFlagEntity,
  'rolePermissionFlag'
>;
