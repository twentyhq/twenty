import { Gate } from 'src/engine/twenty-orm/interfaces/gate.interface';

export interface WorkspaceExtendedEntityMetadataArgs {
  /**
   * Class to which table is applied.
   * Function target is a table defined in the class.
   * String target is a table defined in a json schema.
   */
  // eslint-disable-next-line @typescript-eslint/ban-types
  readonly target: Function;

  /**
   * Entity gate.
   */
  readonly gate?: Gate;

  /**
   * Enable soft delete.
   */
  readonly softDelete?: boolean;
}
