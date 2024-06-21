export interface WorkspaceIndexMetadataArgs {
  /**
   * Class to which field is applied.
   */
  // eslint-disable-next-line @typescript-eslint/ban-types
  readonly target: Function;

  name: string;
  columns: string[];
  expression?: string;
}
