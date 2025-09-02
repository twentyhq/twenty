import { type RoleEntity } from 'src/engine/metadata-modules/role/role.entity';

export const roleEntityRelationProperties = [
  'roleTargets',
  'objectPermissions',
  'permissionFlags',
  'fieldPermissions',
] as const;

export type RoleEntityRelationProperties =
  (typeof roleEntityRelationProperties)[number];

export type FlatRole = Omit<
  RoleEntity,
  RoleEntityRelationProperties | 'createdAt' | 'updatedAt'
> & {
  universalIdentifier: string;
};
