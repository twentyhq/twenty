import { type FlatEntityFrom } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';
import { type RoleEntity } from 'src/engine/metadata-modules/role/role.entity';

type NonSyncableRoleEntityRelationProperties =
  | 'objectPermissions'
  | 'permissionFlags'
  | 'fieldPermissions';

export type FlatRole = FlatEntityFrom<
  Omit<RoleEntity, NonSyncableRoleEntityRelationProperties>
> & {
  roleTargetIds: string[];
  objectPermissionIds: string[];
  permissionFlagIds: string[];
  fieldPermissionIds: string[];
};
