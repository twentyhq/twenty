import { Logger } from '@nestjs/common';

import { type Repository } from 'typeorm';
import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError';
import { type EntityMetadata } from 'typeorm/metadata/EntityMetadata';
import { isDefined } from 'twenty-shared/utils';

import { type UpgradeAwareRepositoryState } from 'src/engine/twenty-orm/upgrade-aware/upgrade-aware-repository-state';
import { UpgradeUnavailableEntityWriteException } from 'src/engine/twenty-orm/upgrade-aware/exceptions/upgrade-unavailable-entity-write.exception';

const logger = new Logger('UpgradeAwareRepositoryProxy');

const METHODS_WITH_FIND_OPTIONS = new Set<string>([
  'find',
  'findBy',
  'findAndCount',
  'findAndCountBy',
  'findOne',
  'findOneBy',
  'findOneOrFail',
  'findOneByOrFail',
  'count',
  'countBy',
  'exists',
  'existsBy',
]);

const SHORT_CIRCUIT_READ_TO_EMPTY_ARRAY = new Set<string>([
  'find',
  'findBy',
]);

const SHORT_CIRCUIT_READ_TO_EMPTY_FIND_AND_COUNT = new Set<string>([
  'findAndCount',
  'findAndCountBy',
]);

const SHORT_CIRCUIT_READ_TO_NULL = new Set<string>(['findOne', 'findOneBy']);

const SHORT_CIRCUIT_READ_TO_ENTITY_NOT_FOUND = new Set<string>([
  'findOneOrFail',
  'findOneByOrFail',
]);

const SHORT_CIRCUIT_READ_TO_ZERO = new Set<string>(['count', 'countBy']);

const SHORT_CIRCUIT_READ_TO_FALSE = new Set<string>(['exists', 'existsBy']);

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

const isShortCircuitableRead = (methodName: string): boolean =>
  SHORT_CIRCUIT_READ_TO_EMPTY_ARRAY.has(methodName) ||
  SHORT_CIRCUIT_READ_TO_EMPTY_FIND_AND_COUNT.has(methodName) ||
  SHORT_CIRCUIT_READ_TO_NULL.has(methodName) ||
  SHORT_CIRCUIT_READ_TO_ENTITY_NOT_FOUND.has(methodName) ||
  SHORT_CIRCUIT_READ_TO_ZERO.has(methodName) ||
  SHORT_CIRCUIT_READ_TO_FALSE.has(methodName);

const shortCircuitReadFor = (
  methodName: string,
  entityClass: Function,
): Promise<unknown> => {
  if (SHORT_CIRCUIT_READ_TO_EMPTY_ARRAY.has(methodName)) {
    return Promise.resolve([]);
  }

  if (SHORT_CIRCUIT_READ_TO_EMPTY_FIND_AND_COUNT.has(methodName)) {
    return Promise.resolve([[], 0]);
  }

  if (SHORT_CIRCUIT_READ_TO_NULL.has(methodName)) {
    return Promise.resolve(null);
  }

  if (SHORT_CIRCUIT_READ_TO_ENTITY_NOT_FOUND.has(methodName)) {
    return Promise.reject(new EntityNotFoundError(entityClass, undefined));
  }

  if (SHORT_CIRCUIT_READ_TO_ZERO.has(methodName)) {
    return Promise.resolve(0);
  }

  if (SHORT_CIRCUIT_READ_TO_FALSE.has(methodName)) {
    return Promise.resolve(false);
  }

  return Promise.resolve(undefined);
};

const stripUnavailableRelations = (
  metadata: EntityMetadata,
  state: UpgradeAwareRepositoryState,
  options: unknown,
): unknown => {
  if (!isDefined(options) || typeof options !== 'object') {
    return options;
  }

  const withRelations = options as { relations?: unknown };

  if (!isDefined(withRelations.relations)) {
    return options;
  }

  if (Array.isArray(withRelations.relations)) {
    const filtered = (withRelations.relations as string[]).filter((name) =>
      isRelationAvailable(metadata, state, name),
    );

    if (filtered.length === withRelations.relations.length) {
      return options;
    }

    return { ...withRelations, relations: filtered };
  }

  if (typeof withRelations.relations === 'object') {
    const filtered: Record<string, unknown> = {};

    for (const [name, value] of Object.entries(
      withRelations.relations as Record<string, unknown>,
    )) {
      if (isRelationAvailable(metadata, state, name)) {
        filtered[name] = value;
      }
    }

    return { ...withRelations, relations: filtered };
  }

  return options;
};

const isRelationAvailable = (
  metadata: EntityMetadata,
  state: UpgradeAwareRepositoryState,
  relationPropertyName: string,
): boolean => {
  const relation = metadata.relations.find(
    (candidate) => candidate.propertyName === relationPropertyName,
  );

  if (!isDefined(relation)) {
    return true;
  }

  const relatedTarget = relation.inverseEntityMetadata?.target;

  if (typeof relatedTarget !== 'function') {
    return true;
  }

  const available = state.isEntityAvailable(relatedTarget);

  if (!available) {
    logger.log(
      `[upgrade-proxy] strip relation ${metadata.targetName}.${relationPropertyName} -> ${relatedTarget.name}`,
    );
  }

  return available;
};

export const wrapRepositoryWithUpgradeAwareProxy = <Entity extends object>({
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

      if (isDefined(methodName) && isShortCircuitableRead(methodName)) {
        return (...args: unknown[]) => {
          if (!state.isEntityAvailable(entityClass)) {
            logger.log(
              `[upgrade-proxy] short-circuit ${entityClass.name}.${methodName}`,
            );

            return shortCircuitReadFor(methodName, entityClass);
          }

          const rewrittenArgs =
            METHODS_WITH_FIND_OPTIONS.has(methodName) && args.length > 0
              ? [
                  stripUnavailableRelations(target.metadata, state, args[0]),
                  ...args.slice(1),
                ]
              : args;

          return (
            target[methodName as keyof Repository<Entity>] as unknown as (
              ...callArgs: unknown[]
            ) => unknown
          ).apply(target, rewrittenArgs);
        };
      }

      if (
        isDefined(methodName) &&
        THROW_ON_UPGRADE_UNAVAILABLE_WRITE.has(methodName)
      ) {
        return (...args: unknown[]) => {
          if (!state.isEntityAvailable(entityClass)) {
            return Promise.reject(
              new UpgradeUnavailableEntityWriteException(
                entityClass.name,
                methodName,
              ),
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
