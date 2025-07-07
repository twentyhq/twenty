export interface CreateRelationAction {
  type: 'create_relation';
}

export interface UpdateRelationAction {
  type: 'update_relation';
}

export interface DeleteRelationAction {
  type: 'delete_relation';
}

export type WorkspaceMigrationRelationActionV2 =
  | CreateRelationAction
  | UpdateRelationAction
  | DeleteRelationAction;
