import { type Gate } from 'src/engine/twenty-orm/interfaces/gate.interface';

type Constructor = new (...args: unknown[]) => unknown;

export interface WorkspaceExtendedEntityMetadataArgs {
  /**
   * Class to which table is applied.
   * Function target is a table defined in the class.
   * String target is a table defined in a json schema.
   */
  readonly target: Constructor;

  /**
   * Entity gate.
   */
  readonly gate?: Gate;
}
