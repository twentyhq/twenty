type Constructor = new (...args: unknown[]) => unknown;

export interface WorkspaceJoinColumnsMetadataArgs {
  /**
   * Class to which relation is applied.
   */
  readonly target: Constructor;

  /**
   * Relation name.
   */
  readonly relationName: string;

  /**
   * Relation label.
   */
  readonly joinColumn: string;
}
