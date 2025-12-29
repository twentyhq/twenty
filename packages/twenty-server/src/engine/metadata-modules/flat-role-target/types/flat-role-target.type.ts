import { type FlatEntityFrom } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';
import { type RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';

type NonSyncableRoleTargetEntityRelationProperties = 'apiKey';

export type FlatRoleTarget = FlatEntityFrom<
  Omit<RoleTargetEntity, NonSyncableRoleTargetEntityRelationProperties>
>;
