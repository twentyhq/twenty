export interface WorkspaceJoinColumnsMetadataArgs {
  /**
   * Class to which relation is applied.
   */
  // eslint-disable-next-line @typescript-eslint/ban-types
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
