import { Logger } from '@nestjs/common';

import { UpdateResult, type Repository } from 'typeorm';
import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError';
import { type EntityMetadata } from 'typeorm/metadata/EntityMetadata';
import { isDefined } from 'twenty-shared/utils';

import { type UpgradeAwareRepositoryState } from 'src/engine/twenty-orm/upgrade-aware/upgrade-aware-repository-state';
import { UpgradeUnavailableEntityWriteException } from 'src/engine/twenty-orm/upgrade-aware/exceptions/upgrade-unavailable-entity-write.exception';

const logger = new Logger('UpgradeAwareRepositoryProxy');

type RepositoryMethodBehavior =
  | {
      kind: 'short-circuit-read';
      produceEmpty: (entityClass: Function) => Promise<unknown>;
    }
  | { kind: 'throw-on-unavailable-write' };

const REPOSITORY_METHOD_BEHAVIORS = new Map<string, RepositoryMethodBehavior>([
  [
    'find',
    { kind: 'short-circuit-read', produceEmpty: () => Promise.resolve([]) },
  ],
  [
    'findBy',
    { kind: 'short-circuit-read', produceEmpty: () => Promise.resolve([]) },
  ],
  [
    'findAndCount',
    {
      kind: 'short-circuit-read',
      produceEmpty: () => Promise.resolve([[], 0]),
    },
  ],
  [
    'findAndCountBy',
    {
      kind: 'short-circuit-read',
      produceEmpty: () => Promise.resolve([[], 0]),
    },
  ],
  [
    'findOne',
    { kind: 'short-circuit-read', produceEmpty: () => Promise.resolve(null) },
  ],
  [
    'findOneBy',
    { kind: 'short-circuit-read', produceEmpty: () => Promise.resolve(null) },
  ],
  [
    'findOneOrFail',
    {
      kind: 'short-circuit-read',
      produceEmpty: (entityClass) =>
        Promise.reject(new EntityNotFoundError(entityClass, undefined)),
    },
  ],
  [
    'findOneByOrFail',
    {
      kind: 'short-circuit-read',
      produceEmpty: (entityClass) =>
        Promise.reject(new EntityNotFoundError(entityClass, undefined)),
    },
  ],
  [
    'count',
    { kind: 'short-circuit-read', produceEmpty: () => Promise.resolve(0) },
  ],
  [
    'countBy',
    { kind: 'short-circuit-read', produceEmpty: () => Promise.resolve(0) },
  ],
  [
    'exists',
    { kind: 'short-circuit-read', produceEmpty: () => Promise.resolve(false) },
  ],
  [
    'existsBy',
    { kind: 'short-circuit-read', produceEmpty: () => Promise.resolve(false) },
  ],
  ['save', { kind: 'throw-on-unavailable-write' }],
  ['insert', { kind: 'throw-on-unavailable-write' }],
  ['update', { kind: 'throw-on-unavailable-write' }],
  ['delete', { kind: 'throw-on-unavailable-write' }],
  ['remove', { kind: 'throw-on-unavailable-write' }],
  ['softRemove', { kind: 'throw-on-unavailable-write' }],
  ['recover', { kind: 'throw-on-unavailable-write' }],
  ['upsert', { kind: 'throw-on-unavailable-write' }],
  ['increment', { kind: 'throw-on-unavailable-write' }],
  ['decrement', { kind: 'throw-on-unavailable-write' }],
  ['restore', { kind: 'throw-on-unavailable-write' }],
  ['softDelete', { kind: 'throw-on-unavailable-write' }],
]);

const METHODS_THAT_ACCEPT_FIND_OPTIONS = new Set<string>([
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

const stripUnavailableSelect = (
  entityClass: Function,
  state: UpgradeAwareRepositoryState,
  options: unknown,
): unknown => {
  if (!isDefined(options) || typeof options !== 'object') {
    return options;
  }

  const withSelect = options as { select?: unknown };

  if (!isDefined(withSelect.select)) {
    return options;
  }

  const hiddenColumnPropertyNames =
    state.getHiddenColumnPropertyNames(entityClass);

  if (hiddenColumnPropertyNames.size === 0) {
    return options;
  }

  if (Array.isArray(withSelect.select)) {
    const filtered = withSelect.select.filter(
      (propertyName) =>
        typeof propertyName !== 'string' ||
        !hiddenColumnPropertyNames.has(propertyName),
    );

    if (filtered.length === withSelect.select.length) {
      return options;
    }

    return { ...withSelect, select: filtered };
  }

  if (typeof withSelect.select === 'object') {
    const filtered = Object.fromEntries(
      Object.entries(withSelect.select).filter(
        ([propertyName]) => !hiddenColumnPropertyNames.has(propertyName),
      ),
    );

    if (
      Object.keys(filtered).length === Object.keys(withSelect.select).length
    ) {
      return options;
    }

    return { ...withSelect, select: filtered };
  }

  return options;
};

// A skipped update never reaches the driver, so the counts TypeORM would have
// filled in have to be stated rather than left undefined: no rows matched.
const buildSkippedUpdateResult = (): UpdateResult => {
  const updateResult = new UpdateResult();

  updateResult.raw = [];
  updateResult.affected = 0;

  return updateResult;
};

const stripUnavailableUpdateValues = (
  entityClass: Function,
  state: UpgradeAwareRepositoryState,
  values: unknown,
): unknown => {
  if (
    !isDefined(values) ||
    typeof values !== 'object' ||
    Array.isArray(values)
  ) {
    return values;
  }

  const hiddenColumnPropertyNames =
    state.getHiddenColumnPropertyNames(entityClass);

  if (hiddenColumnPropertyNames.size === 0) {
    return values;
  }

  const entries = Object.entries(values as Record<string, unknown>);
  const keptEntries = entries.filter(
    ([propertyName]) => !hiddenColumnPropertyNames.has(propertyName),
  );

  if (keptEntries.length === entries.length) {
    return values;
  }

  logger.log(
    `[upgrade-proxy] strip update values on ${entityClass.name}: ${entries
      .filter(([propertyName]) => hiddenColumnPropertyNames.has(propertyName))
      .map(([propertyName]) => propertyName)
      .join(',')}`,
  );

  return Object.fromEntries(keptEntries);
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

const isClassConstructor = (fn: Function): boolean =>
  typeof fn.prototype === 'object' &&
  fn.prototype !== null &&
  fn.prototype.constructor === fn &&
  fn.toString().startsWith('class ');

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
      const behavior = isDefined(methodName)
        ? REPOSITORY_METHOD_BEHAVIORS.get(methodName)
        : undefined;

      if (isDefined(methodName) && isDefined(behavior)) {
        return (...args: unknown[]) =>
          handleRepositoryMethodCall({
            target,
            methodName,
            entityClass,
            state,
            behavior,
            args,
          });
      }

      const value = Reflect.get(target, prop, receiver);

      if (typeof value === 'function' && !isClassConstructor(value)) {
        return value.bind(target);
      }

      return value;
    },
  });

const handleRepositoryMethodCall = <Entity extends object>({
  target,
  methodName,
  entityClass,
  state,
  behavior,
  args,
}: {
  target: Repository<Entity>;
  methodName: string;
  entityClass: Function;
  state: UpgradeAwareRepositoryState;
  behavior: RepositoryMethodBehavior;
  args: unknown[];
}): unknown => {
  if (!state.isEntityAvailable(entityClass)) {
    if (behavior.kind === 'throw-on-unavailable-write') {
      return Promise.reject(
        new UpgradeUnavailableEntityWriteException(
          entityClass.name,
          methodName,
        ),
      );
    }

    logger.log(
      `[upgrade-proxy] short-circuit ${entityClass.name}.${methodName}`,
    );

    return behavior.produceEmpty(entityClass);
  }

  if (methodName === 'update' && args.length > 1) {
    const updateValues = stripUnavailableUpdateValues(
      entityClass,
      state,
      args[1],
    );

    // Nothing the caller asked to write exists at this cursor, and TypeORM
    // rejects an empty value set, so report the no-op instead of running it.
    if (
      updateValues !== args[1] &&
      Object.keys(updateValues as Record<string, unknown>).length === 0
    ) {
      return Promise.resolve(buildSkippedUpdateResult());
    }

    return callRepositoryMethod({
      target,
      methodName,
      args: [args[0], updateValues, ...args.slice(2)],
    });
  }

  const rewrittenArgs =
    METHODS_THAT_ACCEPT_FIND_OPTIONS.has(methodName) && args.length > 0
      ? [
          stripUnavailableSelect(
            entityClass,
            state,
            stripUnavailableRelations(target.metadata, state, args[0]),
          ),
          ...args.slice(1),
        ]
      : args;

  return callRepositoryMethod({ target, methodName, args: rewrittenArgs });
};

const callRepositoryMethod = <Entity extends object>({
  target,
  methodName,
  args,
}: {
  target: Repository<Entity>;
  methodName: string;
  args: unknown[];
}): unknown =>
  (
    target[methodName as keyof Repository<Entity>] as unknown as (
      ...callArgs: unknown[]
    ) => unknown
  ).apply(target, args);
