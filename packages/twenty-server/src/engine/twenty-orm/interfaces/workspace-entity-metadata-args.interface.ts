import { Gate } from 'src/engine/twenty-orm/interfaces/gate.interface';

export interface WorkspaceEntityMetadataArgs {
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
  readonly target: Function;

  /**
   * Entity name.
   */
  readonly nameSingular: string;
  readonly namePlural: string;

  /**
   * Entity label.
   */
  readonly labelSingular: string;
  readonly labelPlural: string;

  /**
   * Entity description.
   */
  readonly description?: string;

  /**
   * Entity icon.
   */
  readonly icon?: string;

  /**
   * Entity shortcut.
   */
  readonly shortcut?: string;

  /**
   * Is audit logged.
   */
  readonly isAuditLogged: boolean;

  /**
   * Is system object.
   */
  readonly isSystem: boolean;

  /**
   * Entity gate.
   */
  readonly gate?: Gate;

  /**
   * Label identifier.
   */
  readonly labelIdentifierStandardId: string | null;

  /**
   * Image identifier.
   */
  readonly imageIdentifierStandardId: string | null;
}
