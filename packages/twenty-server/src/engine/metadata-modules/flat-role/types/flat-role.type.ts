import { type FlatEntityFrom } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type RoleEntity } from 'src/engine/metadata-modules/role/role.entity';

export type FlatRole = FlatEntityFrom<RoleEntity> & {
  // TODO remove once objectPermission rolePermissionFlag fieldPermission have been migrated to v2
  objectPermissionIds: string[];
  rolePermissionFlagIds: string[];
  fieldPermissionIds: string[];
};
