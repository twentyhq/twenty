import { type Gate } from 'src/engine/twenty-orm/interfaces/gate.interface';

import { type WorkspaceEntityDuplicateCriteria } from 'src/engine/api/graphql/workspace-query-builder/types/workspace-entity-duplicate-criteria.type';

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
   * Is UI read-only object.
   */
  readonly isUIReadOnly: boolean;

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

  /**
   * Duplicate criteria.
   */
  readonly duplicateCriteria?: WorkspaceEntityDuplicateCriteria[];

  /**
   * Is searchable object.
   */
  readonly isSearchable: boolean;
}
