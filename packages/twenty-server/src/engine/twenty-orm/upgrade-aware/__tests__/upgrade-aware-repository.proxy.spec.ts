import 'reflect-metadata';

import { type Repository } from 'typeorm';

import { UpgradeAwareRepositoryState } from 'src/engine/twenty-orm/upgrade-aware/upgrade-aware-repository-state';
import { wrapRepositoryWithUpgradeAwareProxy } from 'src/engine/twenty-orm/upgrade-aware/upgrade-aware-repository.proxy';

class UnavailableEntity {}

describe('wrapRepositoryWithUpgradeAwareProxy', () => {
  it('short-circuits find() to an empty array when the entity is unavailable', async () => {
    const find = jest.fn().mockResolvedValue([{ id: 1 }]);
    const repository = { find } as unknown as Repository<UnavailableEntity>;

    const state = new (UpgradeAwareRepositoryState as unknown as {
      new (): UpgradeAwareRepositoryState;
    })();

    state.setMetadataService({
      isEntityAvailable: () => false,
      getHiddenColumnPropertyNames: () => new Set(),
    } as never);

    const wrapped = wrapRepositoryWithUpgradeAwareProxy({
      repository,
      entityClass: UnavailableEntity,
      state,
    });

    await expect(wrapped.find()).resolves.toEqual([]);
    expect(find).not.toHaveBeenCalled();
  });
});
