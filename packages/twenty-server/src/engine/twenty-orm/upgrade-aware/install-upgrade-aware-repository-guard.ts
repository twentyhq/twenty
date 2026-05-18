import { type DataSource, type EntityTarget } from 'typeorm';

import { UpgradeAwareRepositoryState } from 'src/engine/twenty-orm/upgrade-aware/upgrade-aware-repository-state';
import { wrapRepositoryWithUpgradeAwareGuard } from 'src/engine/twenty-orm/upgrade-aware/upgrade-aware-repository.proxy';

// Overrides DataSource.getRepository so every repository returned (including
// the cached instances that @nestjs/typeorm's @InjectRepository providers
// resolve at module construction) is wrapped with the upgrade-aware guard.
// Must run before any TypeOrmModule.forFeature provider resolves — call it
// from the TypeOrmModule.forRootAsync dataSourceFactory.

export const installUpgradeAwareRepositoryGuard = (
  dataSource: DataSource,
): void => {
  const state = UpgradeAwareRepositoryState.getInstance();
  const originalGetRepository = dataSource.getRepository.bind(dataSource);

  const wrappedRepositoryCache = new WeakMap<object, object>();

  dataSource.getRepository = function getRepositoryWithUpgradeAwareGuard<
    Entity extends object,
  >(target: EntityTarget<Entity>) {
    const repository = originalGetRepository(target);

    const entityClass = resolveEntityClass(target);

    if (entityClass === null) {
      return repository;
    }

    const cached = wrappedRepositoryCache.get(repository);

    if (cached) {
      return cached as typeof repository;
    }

    const wrapped = wrapRepositoryWithUpgradeAwareGuard({
      repository,
      entityClass,
      state,
    });

    wrappedRepositoryCache.set(repository, wrapped);

    return wrapped;
  } as DataSource['getRepository'];
};

const resolveEntityClass = <Entity extends object>(
  target: EntityTarget<Entity>,
): Function | null => {
  if (typeof target === 'function') {
    return target;
  }

  return null;
};
