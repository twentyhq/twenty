import { Logger } from '@nestjs/common';

import { type DataSource, type EntityTarget } from 'typeorm';
import { isDefined } from 'twenty-shared/utils';

import { UpgradeAwareRepositoryState } from 'src/engine/twenty-orm/upgrade-aware/upgrade-aware-repository-state';
import { wrapRepositoryWithUpgradeAwareProxy } from 'src/engine/twenty-orm/upgrade-aware/upgrade-aware-repository.proxy';

const logger = new Logger('InstallUpgradeAwareRepositoryProxy');

export const installUpgradeAwareRepositoryProxy = (
  dataSource: DataSource,
): void => {
  const state = UpgradeAwareRepositoryState.getInstance();
  const originalGetRepository = dataSource.getRepository.bind(dataSource);

  const wrappedRepositoryCache = new WeakMap<object, object>();

  dataSource.getRepository = function getRepositoryWithUpgradeAwareProxy<
    Entity extends object,
  >(target: EntityTarget<Entity>) {
    const repository = originalGetRepository(target);

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
  } as DataSource['getRepository'];

  logger.log(
    '[upgrade-proxy] installed getRepository proxy on core DataSource',
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
