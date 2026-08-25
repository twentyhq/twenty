import { CACHE_FETCHABLE_ENTITY_BY_NAME } from 'src/engine/workspace-cache/constants/cache-fetchable-entity-by-name.constant';

export type CacheFetchableEntityName =
  keyof typeof CACHE_FETCHABLE_ENTITY_BY_NAME;

export type CacheFetchableEntity<TName extends CacheFetchableEntityName> =
  InstanceType<(typeof CACHE_FETCHABLE_ENTITY_BY_NAME)[TName]>;

// true = full rows; a column array = exactly what computeForCache reads,
// typo-checked against the named entity.
export type CacheEntityFetchShape = {
  [TName in CacheFetchableEntityName]?:
    | readonly (keyof CacheFetchableEntity<TName> & string)[]
    | true;
};

export type CacheEntityFetchShapeRows<TShape extends CacheEntityFetchShape> = {
  [TName in keyof TShape &
    CacheFetchableEntityName]: CacheFetchableEntity<TName>[];
};
