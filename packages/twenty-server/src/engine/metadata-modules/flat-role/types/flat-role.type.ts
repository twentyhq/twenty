import { type FlatEntityFrom } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';
import { type RoleEntity } from 'src/engine/metadata-modules/role/role.entity';

export const roleEntityRelationProperties = [
  'roleTargets',
  'objectPermissions',
  'permissionFlags',
  'fieldPermissions',
] as const;

export type RoleEntityRelationProperties =
  (typeof roleEntityRelationProperties)[number];

export type FlatRole = FlatEntityFrom<
  RoleEntity,
  RoleEntityRelationProperties | 'createdAt' | 'updatedAt'
>;
