export interface WorkspaceIndexMetadataArgs {
  /**
   * Class to which index is applied.
   */
  // eslint-disable-next-line @typescript-eslint/ban-types
  readonly target: Function;

  /*
   * Index name.
   */
  name: string;

  /*
   * Index columns.
   */
  columns: string[];
}
