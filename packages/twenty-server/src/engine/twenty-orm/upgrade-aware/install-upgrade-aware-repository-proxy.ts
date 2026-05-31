import { Logger } from '@nestjs/common';

import {
  type DataSource,
  type EntityManager,
  type EntityTarget,
  type Repository,
} from 'typeorm';
import { isDefined } from 'twenty-shared/utils';

import { UpgradeAwareRepositoryState } from 'src/engine/twenty-orm/upgrade-aware/upgrade-aware-repository-state';
import { wrapRepositoryWithUpgradeAwareProxy } from 'src/engine/twenty-orm/upgrade-aware/upgrade-aware-repository.proxy';

const logger = new Logger('InstallUpgradeAwareRepositoryProxy');

const wrappedRepositoryCache = new WeakMap<object, object>();

export const installUpgradeAwareRepositoryProxy = (
  dataSource: DataSource,
): void => {
  const state = UpgradeAwareRepositoryState.getInstance();

  const wrapIfNeeded = <Entity extends object>(
    target: EntityTarget<Entity>,
    repository: Repository<Entity>,
  ): Repository<Entity> => {
    const entityClass = resolveEntityClass(target);

    if (!isDefined(entityClass)) {
      return repository;
    }

    const cached = wrappedRepositoryCache.get(repository);

    if (isDefined(cached)) {
      return cached as typeof repository;
    }

    const wrapped = wrapRepositoryWithUpgradeAwareProxy({
      repository,
      entityClass,
      state,
    });

    wrappedRepositoryCache.set(repository, wrapped);

    return wrapped;
  };

  const originalDataSourceGetRepository =
    dataSource.getRepository.bind(dataSource);

  dataSource.getRepository = function getRepositoryWithUpgradeAwareProxy<
    Entity extends object,
  >(target: EntityTarget<Entity>) {
    return wrapIfNeeded(target, originalDataSourceGetRepository(target));
  } as DataSource['getRepository'];

  const entityManagerPrototype = Object.getPrototypeOf(dataSource.manager) as {
    getRepository: EntityManager['getRepository'];
  };
  const originalEntityManagerGetRepository =
    entityManagerPrototype.getRepository;

  entityManagerPrototype.getRepository =
    function getRepositoryWithUpgradeAwareProxy<Entity extends object>(
      this: EntityManager,
      target: EntityTarget<Entity>,
    ) {
      const repository = originalEntityManagerGetRepository.call(this, target);

      if (this.connection !== dataSource) {
        return repository;
      }

      return wrapIfNeeded(target, repository);
    } as EntityManager['getRepository'];

  logger.log(
    '[upgrade-proxy] installed getRepository proxy on core DataSource and EntityManager.prototype',
  );
};

const resolveEntityClass = <Entity extends object>(
  target: EntityTarget<Entity>,
): Function | undefined => {
  if (typeof target === 'function') {
    return target;
  }

  return undefined;
};
