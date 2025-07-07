export interface CreateIndexAction {
  type: 'create_index';
}

export interface DeleteIndexAction {
  type: 'delete_index';
}

export type WorkspaceMigrationIndexActionV2 =
  | CreateIndexAction
  | DeleteIndexAction;
