import { type RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';
import { type UniversalFlatEntityFrom } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-from.type';

export type UniversalFlatRoleTarget = UniversalFlatEntityFrom<
  RoleTargetEntity,
  'roleTarget'
>;
