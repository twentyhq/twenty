import { type FlatEntityFrom } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';
import { type RoleTargetsEntity } from 'src/engine/metadata-modules/role/role-targets.entity';

export const roleTargetsEntityRelationProperties = ['role', 'apiKey'] as const;

export type RoleTargetsEntityRelationProperties =
  (typeof roleTargetsEntityRelationProperties)[number];

export type FlatRoleTarget = FlatEntityFrom<
  RoleTargetsEntity,
  RoleTargetsEntityRelationProperties
>;
