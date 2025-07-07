export type CreateRelationAction = {
  type: 'create_relation';
}

export type UpdateRelationAction = {
  type: 'update_relation';
}

export type DeleteRelationAction = {
  type: 'delete_relation';
}

export type WorkspaceMigrationRelationActionV2 =
  | CreateRelationAction
  | UpdateRelationAction
  | DeleteRelationAction;
