import { CACHE_FETCHABLE_ENTITY_BY_NAME } from 'src/engine/workspace-cache/constants/cache-fetchable-entity-by-name.constant';

export type CacheFetchableEntityName =
  keyof typeof CACHE_FETCHABLE_ENTITY_BY_NAME;

export type CacheFetchableEntity<TName extends CacheFetchableEntityName> =
  InstanceType<(typeof CACHE_FETCHABLE_ENTITY_BY_NAME)[TName]>;

type EntityColumns<TName extends CacheFetchableEntityName> =
  readonly (keyof CacheFetchableEntity<TName> & string)[];

// true = full rows; a column array = exactly what computeForCache reads,
// typo-checked against the named entity. The grouped form additionally asks
// getRowsByName to index the rows by the given foreign key columns; groupBy
// keys are auto-added to the fetched columns, so a declared grouping is
// always backed by fetched data.
export type CacheEntityFetchSpec<TName extends CacheFetchableEntityName> =
  | EntityColumns<TName>
  | true
  | {
      columns: EntityColumns<TName> | true;
      groupBy: EntityColumns<TName>;
    };

export type CacheEntityFetchShape = {
  [TName in CacheFetchableEntityName]?: CacheEntityFetchSpec<TName>;
};

export type GroupedCacheEntityFetchSpec = {
  columns: readonly string[] | true;
  groupBy: readonly string[];
};

// Widened form every CacheEntityFetchSpec<TName> is assignable to, for code
// that processes specs generically across entity names.
export type WidenedCacheEntityFetchSpec =
  | true
  | readonly string[]
  | GroupedCacheEntityFetchSpec;

type GroupedEntityRows<
  TName extends CacheFetchableEntityName,
  TGroupBy extends readonly string[],
> = {
  rows: CacheFetchableEntity<TName>[];
} & {
  [TForeignKey in TGroupBy[number] as `by${Capitalize<TForeignKey>}`]: Map<
    string,
    CacheFetchableEntity<TName>[]
  >;
};

export type CacheEntityFetchShapeRows<TShape extends CacheEntityFetchShape> = {
  [TName in keyof TShape & CacheFetchableEntityName]: TShape[TName] extends {
    groupBy: infer TGroupBy extends readonly string[];
  }
    ? GroupedEntityRows<TName, TGroupBy>
    : CacheFetchableEntity<TName>[];
};
