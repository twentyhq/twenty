import { type FlatEntityFrom } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';
import { type RoleEntity } from 'src/engine/metadata-modules/role/role.entity';

export type FlatRole = FlatEntityFrom<RoleEntity> & {
  // TOOD remove once objectPermission permissionFlag fieldPermission have been migrated to v2
  objectPermissionIds: string[];
  permissionFlagIds: string[];
  fieldPermissionIds: string[];
};
