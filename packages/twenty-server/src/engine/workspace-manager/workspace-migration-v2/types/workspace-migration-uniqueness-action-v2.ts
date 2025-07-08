export type AddUniquenessConstraintAction = {
  type: 'add_uniqueness_constraint';
};

export type RemoveUniquenessConstraintAction = {
  type: 'remove_uniqueness_constraint';
};

export type WorkspaceMigrationUniquenessActionV2 =
  | RemoveUniquenessConstraintAction
  | AddUniquenessConstraintAction;
