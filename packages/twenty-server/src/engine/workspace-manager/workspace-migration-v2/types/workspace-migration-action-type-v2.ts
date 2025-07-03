export type WorkspaceMigrationActionTypeV2 =
  | 'create_object'
  | 'update_object'
  | 'delete_object'
  | 'create_field'
  | 'update_field'
  | 'delete_field'
  | 'create_relation'
  | 'update_relation'
  | 'delete_relation'
  | 'create_index'
  | 'delete_index'
  | 'add_uniqueness_constraint'
  | 'remove_uniqueness_constraint';
