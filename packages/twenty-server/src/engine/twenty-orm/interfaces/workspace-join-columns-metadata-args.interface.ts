export interface WorkspaceJoinColumnsMetadataArgs {
  /**
   * Class to which relation is applied.
   */

  readonly target: Function;

  /**
   * Relation name.
   */
  readonly relationName: string;

  /**
   * Relation label.
   */
  readonly joinColumn: string;
}
