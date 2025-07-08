export type CreateIndexAction = {
  type: 'create_index';
};

export type DeleteIndexAction = {
  type: 'delete_index';
};

export type WorkspaceMigrationIndexActionV2 =
  | CreateIndexAction
  | DeleteIndexAction;
