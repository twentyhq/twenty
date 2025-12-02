import { type FlatEntityPropertiesUpdates } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-properties-updates.type';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';

export type CreateRoleAction = {
  type: 'create_role';
  role: FlatRole;
};

export type UpdateRoleAction = {
  type: 'update_role';
  roleId: string;
  updates: FlatEntityPropertiesUpdates<'role'>;
};

export type DeleteRoleAction = {
  type: 'delete_role';
  roleId: string;
};

export type WorkspaceMigrationRoleActionV2 =
  | CreateRoleAction
  | UpdateRoleAction
  | DeleteRoleAction;

export type WorkspaceMigrationRoleActionTypeV2 =
  WorkspaceMigrationRoleActionV2['type'];
