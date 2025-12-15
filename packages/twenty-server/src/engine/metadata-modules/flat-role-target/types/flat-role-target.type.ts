import { type FlatEntityFrom } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';
import { type RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';

export const roleTargetsEntityRelationProperties = ['role', 'apiKey'] as const;

export type RoleTargetsEntityRelationProperties =
  (typeof roleTargetsEntityRelationProperties)[number];

export type FlatRoleTarget = FlatEntityFrom<
  RoleTargetEntity,
  RoleTargetsEntityRelationProperties
>;
