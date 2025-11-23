import { type FlatEntityPropertiesUpdates } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-properties-updates.type';
import { type FlatRoleTarget } from 'src/engine/metadata-modules/flat-role-target/types/flat-role-target.type';

export type CreateRoleTargetAction = {
  type: 'create_role_target';
  roleTarget: FlatRoleTarget;
};

export type UpdateRoleTargetAction = {
  type: 'update_role_target';
  roleTargetId: string;
  updates: FlatEntityPropertiesUpdates<'roleTarget'>;
};

export type DeleteRoleTargetAction = {
  type: 'delete_role_target';
  roleTargetId: string;
};

export type WorkspaceMigrationRoleTargetActionV2 =
  | CreateRoleTargetAction
  | UpdateRoleTargetAction
  | DeleteRoleTargetAction;

export type WorkspaceMigrationRoleTargetActionTypeV2 =
  WorkspaceMigrationRoleTargetActionV2['type'];

