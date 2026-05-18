import { type Repository } from 'typeorm';

import { type UpgradeAwareRepositoryState } from 'src/engine/twenty-orm/upgrade-aware/upgrade-aware-repository-state';
import { UpgradeUnavailableEntityWriteException } from 'src/engine/twenty-orm/upgrade-aware/exceptions/upgrade-unavailable-entity-write.exception';

// Repository method names that should short-circuit to an empty result when
// the entity is not yet introduced at the current upgrade position. These are
// the operations cache providers and similar code call during workspace
// iteration; returning empty matches the "entity has no rows yet" semantics
// the surrounding code already handles for fresh workspaces.

const SHORT_CIRCUIT_READ_TO_EMPTY_ARRAY = new Set<string>([
  'find',
  'findBy',
  'findAndCount',
  'findAndCountBy',
]);

const SHORT_CIRCUIT_READ_TO_UNDEFINED = new Set<string>([
  'findOne',
  'findOneBy',
]);

const SHORT_CIRCUIT_READ_TO_NULL = new Set<string>([
  'findOneOrFail',
  'findOneByOrFail',
]);

const SHORT_CIRCUIT_READ_TO_ZERO = new Set<string>([
  'count',
  'countBy',
]);

const SHORT_CIRCUIT_READ_TO_FALSE = new Set<string>([
  'exists',
  'existsBy',
]);

const THROW_ON_UPGRADE_UNAVAILABLE_WRITE = new Set<string>([
  'save',
  'insert',
  'update',
  'delete',
  'remove',
  'softRemove',
  'recover',
  'upsert',
  'increment',
  'decrement',
  'restore',
  'softDelete',
]);

const shortCircuitReadFor = (methodName: string): unknown => {
  if (SHORT_CIRCUIT_READ_TO_EMPTY_ARRAY.has(methodName)) {
    if (methodName === 'findAndCount' || methodName === 'findAndCountBy') {
      return [[], 0];
    }

    return [];
  }

  if (SHORT_CIRCUIT_READ_TO_UNDEFINED.has(methodName)) {
    return null;
  }

  if (SHORT_CIRCUIT_READ_TO_NULL.has(methodName)) {
    return null;
  }

  if (SHORT_CIRCUIT_READ_TO_ZERO.has(methodName)) {
    return 0;
  }

  if (SHORT_CIRCUIT_READ_TO_FALSE.has(methodName)) {
    return false;
  }

  return undefined;
};

const isShortCircuitableRead = (methodName: string): boolean =>
  SHORT_CIRCUIT_READ_TO_EMPTY_ARRAY.has(methodName) ||
  SHORT_CIRCUIT_READ_TO_UNDEFINED.has(methodName) ||
  SHORT_CIRCUIT_READ_TO_NULL.has(methodName) ||
  SHORT_CIRCUIT_READ_TO_ZERO.has(methodName) ||
  SHORT_CIRCUIT_READ_TO_FALSE.has(methodName);

// Wraps a TypeORM Repository so that calls touching an upgrade-unavailable
// entity either resolve to empty results (reads) or throw (writes). Other
// methods — including createQueryBuilder and metadata access — pass through
// to the real repository unchanged.
export const wrapRepositoryWithUpgradeAwareGuard = <Entity extends object>({
  repository,
  entityClass,
  state,
}: {
  repository: Repository<Entity>;
  entityClass: Function;
  state: UpgradeAwareRepositoryState;
}): Repository<Entity> =>
  new Proxy(repository, {
    get(target, prop, receiver) {
      const methodName = typeof prop === 'string' ? prop : undefined;

      if (methodName !== undefined && isShortCircuitableRead(methodName)) {
        return (...args: unknown[]) => {
          if (!state.isEntityAvailable(entityClass)) {
            return Promise.resolve(shortCircuitReadFor(methodName));
          }

          return (
            target[methodName as keyof Repository<Entity>] as unknown as (
              ...callArgs: unknown[]
            ) => unknown
          ).apply(target, args);
        };
      }

      if (
        methodName !== undefined &&
        THROW_ON_UPGRADE_UNAVAILABLE_WRITE.has(methodName)
      ) {
        return (...args: unknown[]) => {
          if (!state.isEntityAvailable(entityClass)) {
            throw new UpgradeUnavailableEntityWriteException(
              entityClass.name,
              methodName,
            );
          }

          return (
            target[methodName as keyof Repository<Entity>] as unknown as (
              ...callArgs: unknown[]
            ) => unknown
          ).apply(target, args);
        };
      }

      const value = Reflect.get(target, prop, receiver);

      if (typeof value === 'function') {
        return value.bind(target);
      }

      return value;
    },
  });
