export interface WorkspaceJoinColumnsMetadataArgs {
  /**
   * Class to which relation is applied.
   */
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
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
