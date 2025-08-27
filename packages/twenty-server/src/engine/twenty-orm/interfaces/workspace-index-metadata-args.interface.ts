import { type Gate } from 'src/engine/twenty-orm/interfaces/gate.interface';

import { type IndexType } from 'src/engine/metadata-modules/index-metadata/types/indexType.types';

export interface WorkspaceIndexMetadataArgs {
  /**
   * Class to which index is applied.
   */

  readonly target: Function;

  /*
   * Index name.
   */
  name: string;

  /*
   * Index columns.
   */
  columns: string[];

  /**
   * Is index unique.
   */
  isUnique: boolean;

  /*
   * Index type. Defaults to Btree.
   */
  type?: IndexType;

  /**
   * Index where clause.
   */
  whereClause: string | null;

  /**
   * Field gate.
   */
  readonly gate?: Gate;
}
