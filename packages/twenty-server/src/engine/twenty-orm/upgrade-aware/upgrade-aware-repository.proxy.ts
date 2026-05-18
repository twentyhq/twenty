import { Logger } from '@nestjs/common';

import { type Repository } from 'typeorm';
import { type EntityMetadata } from 'typeorm/metadata/EntityMetadata';

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

const stripUnavailableRelations = (
  metadata: EntityMetadata,
  state: UpgradeAwareRepositoryState,
  options: unknown,
): unknown => {
  if (
    options === null ||
    options === undefined ||
    typeof options !== 'object'
  ) {
    return options;
  }

  const withRelations = options as { relations?: unknown };

  if (!withRelations.relations) {
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

  if (relation === undefined) {
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

      if (methodName !== undefined && isShortCircuitableRead(methodName)) {
        return (...args: unknown[]) => {
          if (!state.isEntityAvailable(entityClass)) {
            logger.log(
              `[upgrade-proxy] short-circuit ${entityClass.name}.${methodName}`,
            );

            return Promise.resolve(shortCircuitReadFor(methodName));
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
