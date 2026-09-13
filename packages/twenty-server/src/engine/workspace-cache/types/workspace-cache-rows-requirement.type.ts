import {
  type FindOptionsOrder,
  type FindOptionsWhere,
  type ObjectLiteral,
} from 'typeorm';

import { type AllMetadataName } from 'twenty-shared/metadata';

import { type MetadataManyToOneJoinColumn } from 'src/engine/metadata-modules/flat-entity/types/metadata-many-to-one-join-column.type';
import { ALL_WORKSPACE_CACHE_ENTITY_BY_NAME } from 'src/engine/workspace-cache/constants/all-workspace-cache-entity-by-name.constant';

export type CacheFetchableEntityName =
  keyof typeof ALL_WORKSPACE_CACHE_ENTITY_BY_NAME;

export type CacheFetchableEntity<TName extends CacheFetchableEntityName> =
  InstanceType<(typeof ALL_WORKSPACE_CACHE_ENTITY_BY_NAME)[TName]>;

type EntityColumns<TName extends CacheFetchableEntityName> =
  readonly (keyof CacheFetchableEntity<TName> & string)[];

export type GroupByColumns<TName extends CacheFetchableEntityName> =
  readonly (TName extends AllMetadataName
    ? MetadataManyToOneJoinColumn<TName> & string
    : keyof CacheFetchableEntity<TName> & string)[];

export type EntityRowsRequirement<TName extends CacheFetchableEntityName> =
  | EntityColumns<TName>
  | true
  | {
      columns: EntityColumns<TName> | true;
      groupBy?: GroupByColumns<TName>;
      where?: FindOptionsWhere<CacheFetchableEntity<TName>>;
      order?: FindOptionsOrder<CacheFetchableEntity<TName>>;
    };

export type WorkspaceCacheRowsRequirement = {
  [TName in CacheFetchableEntityName]?: EntityRowsRequirement<TName>;
};

export type ObjectEntityRowsRequirement = {
  columns: readonly string[] | true;
  groupBy?: readonly string[];
  where?: FindOptionsWhere<ObjectLiteral>;
  order?: FindOptionsOrder<ObjectLiteral>;
};

export type WidenedEntityRowsRequirement =
  | true
  | readonly string[]
  | ObjectEntityRowsRequirement;

type PickedRow<
  TName extends CacheFetchableEntityName,
  TColumns extends readonly string[] | true,
> = TColumns extends readonly string[]
  ? Pick<
      CacheFetchableEntity<TName>,
      TColumns[number] & keyof CacheFetchableEntity<TName>
    >
  : CacheFetchableEntity<TName>;

type GroupedRow<
  TName extends CacheFetchableEntityName,
  TColumns extends readonly string[] | true,
  TGroupBy extends readonly string[],
> = TColumns extends readonly string[]
  ? Pick<
      CacheFetchableEntity<TName>,
      (TColumns[number] | TGroupBy[number]) & keyof CacheFetchableEntity<TName>
    >
  : CacheFetchableEntity<TName>;

export type WorkspaceCacheRows<
  TRowsRequirement extends WorkspaceCacheRowsRequirement,
> = {
  [TName in keyof TRowsRequirement &
    CacheFetchableEntityName]: TRowsRequirement[TName] extends {
    columns: infer TColumns extends readonly string[] | true;
    groupBy: infer TGroupBy extends readonly string[];
  }
    ? { rows: GroupedRow<TName, TColumns, TGroupBy>[] } & {
        [TForeignKey in TGroupBy[number] as `by${Capitalize<TForeignKey>}`]: Map<
          string,
          GroupedRow<TName, TColumns, TGroupBy>[]
        >;
      }
    : TRowsRequirement[TName] extends {
          columns: infer TColumns extends readonly string[] | true;
        }
      ? PickedRow<TName, TColumns>[]
      : TRowsRequirement[TName] extends readonly string[]
        ? PickedRow<TName, TRowsRequirement[TName]>[]
        : CacheFetchableEntity<TName>[];
};
