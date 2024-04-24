import { Gate } from 'src/engine/twenty-orm/interfaces/gate.interface';

export interface WorkspaceObjectMetadataArgs {
  /**
   * Standard id.
   */
  readonly standardId: string;

  /**
   * Class to which table is applied.
   * Function target is a table defined in the class.
   * String target is a table defined in a json schema.
   */
  // eslint-disable-next-line @typescript-eslint/ban-types
  readonly target: Function | string;

  /**
   * Object name.
   */
  readonly nameSingular: string;
  readonly namePlural: string;

  /**
   * Object label.
   */
  readonly labelSingular: string;
  readonly labelPlural: string;

  /**
   * Object description.
   */
  readonly description?: string;

  /**
   * Object icon.
   */
  readonly icon?: string;

  /**
   * Is audit logged.
   */
  readonly isAuditLogged: boolean;

  /**
   * Is system object.
   */
  readonly isSystem?: boolean;

  /**
   * Object gate.
   */
  readonly gate?: Gate;
}
