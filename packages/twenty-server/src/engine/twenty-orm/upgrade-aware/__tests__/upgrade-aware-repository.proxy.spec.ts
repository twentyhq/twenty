import 'reflect-metadata';

import { type Repository } from 'typeorm';

import { UpgradeUnavailableEntityWriteException } from 'src/engine/twenty-orm/upgrade-aware/exceptions/upgrade-unavailable-entity-write.exception';
import { UpgradeAwareRepositoryState } from 'src/engine/twenty-orm/upgrade-aware/upgrade-aware-repository-state';
import { wrapRepositoryWithUpgradeAwareProxy } from 'src/engine/twenty-orm/upgrade-aware/upgrade-aware-repository.proxy';

class FakeEntity {}

const buildFakeRepository = () => {
  const find = jest.fn().mockResolvedValue([{ id: 1 }]);
  const findOne = jest.fn().mockResolvedValue({ id: 1 });
  const count = jest.fn().mockResolvedValue(7);
  const save = jest.fn().mockResolvedValue({ id: 1 });
  const insert = jest.fn().mockResolvedValue({ identifiers: [{ id: 1 }] });

  return {
    repository: { find, findOne, count, save, insert } as unknown as Repository<FakeEntity>,
    mocks: { find, findOne, count, save, insert },
  };
};

const buildState = (isAvailable: boolean) => {
  const state = new (UpgradeAwareRepositoryState as unknown as {
    new (): UpgradeAwareRepositoryState;
  })();

  state.setMetadataService({
    isEntityAvailable: () => isAvailable,
    getHiddenColumnPropertyNames: () => new Set(),
  } as never);

  return state;
};

describe('wrapRepositoryWithUpgradeAwareProxy', () => {
  it('should short-circuit find() to an empty array when the entity is unavailable', async () => {
    const { repository, mocks } = buildFakeRepository();

    const wrapped = wrapRepositoryWithUpgradeAwareProxy({
      repository,
      entityClass: FakeEntity,
      state: buildState(false),
    });

    await expect(wrapped.find()).resolves.toEqual([]);
    expect(mocks.find).not.toHaveBeenCalled();
  });

  it('should short-circuit findOne() to null when the entity is unavailable', async () => {
    const { repository, mocks } = buildFakeRepository();

    const wrapped = wrapRepositoryWithUpgradeAwareProxy({
      repository,
      entityClass: FakeEntity,
      state: buildState(false),
    });

    await expect(wrapped.findOne({} as never)).resolves.toBeNull();
    expect(mocks.findOne).not.toHaveBeenCalled();
  });

  it('should short-circuit count() to 0 when the entity is unavailable', async () => {
    const { repository, mocks } = buildFakeRepository();

    const wrapped = wrapRepositoryWithUpgradeAwareProxy({
      repository,
      entityClass: FakeEntity,
      state: buildState(false),
    });

    await expect(wrapped.count()).resolves.toBe(0);
    expect(mocks.count).not.toHaveBeenCalled();
  });

  it('should pass reads through when the entity is available', async () => {
    const { repository, mocks } = buildFakeRepository();

    const wrapped = wrapRepositoryWithUpgradeAwareProxy({
      repository,
      entityClass: FakeEntity,
      state: buildState(true),
    });

    await expect(wrapped.find()).resolves.toEqual([{ id: 1 }]);
    expect(mocks.find).toHaveBeenCalledTimes(1);
  });

  it('should throw UpgradeUnavailableEntityWriteException on writes when unavailable', () => {
    const { repository, mocks } = buildFakeRepository();

    const wrapped = wrapRepositoryWithUpgradeAwareProxy({
      repository,
      entityClass: FakeEntity,
      state: buildState(false),
    });

    expect(() => wrapped.save({} as never)).toThrow(
      UpgradeUnavailableEntityWriteException,
    );
    expect(() => wrapped.insert({} as never)).toThrow(
      UpgradeUnavailableEntityWriteException,
    );
    expect(mocks.save).not.toHaveBeenCalled();
    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it('should pass writes through when available', async () => {
    const { repository, mocks } = buildFakeRepository();

    const wrapped = wrapRepositoryWithUpgradeAwareProxy({
      repository,
      entityClass: FakeEntity,
      state: buildState(true),
    });

    await wrapped.save({} as never);
    await wrapped.insert({} as never);
    expect(mocks.save).toHaveBeenCalledTimes(1);
    expect(mocks.insert).toHaveBeenCalledTimes(1);
  });

  it('should strip relations whose target entity is unavailable from find options', async () => {
    class UnavailableTarget {}
    class AvailableTarget {}

    const { repository, mocks } = buildFakeRepository();

    Object.assign(repository, {
      metadata: {
        relations: [
          {
            propertyName: 'unavailable',
            inverseEntityMetadata: { target: UnavailableTarget },
          },
          {
            propertyName: 'available',
            inverseEntityMetadata: { target: AvailableTarget },
          },
        ],
      },
    });

    const state = new (UpgradeAwareRepositoryState as unknown as {
      new (): UpgradeAwareRepositoryState;
    })();

    state.setMetadataService({
      isEntityAvailable: (entityClass: Function) =>
        entityClass !== UnavailableTarget,
      getHiddenColumnPropertyNames: () => new Set(),
    } as never);

    const wrapped = wrapRepositoryWithUpgradeAwareProxy({
      repository,
      entityClass: FakeEntity,
      state,
    });

    await wrapped.find({
      where: { id: 1 },
      relations: ['unavailable', 'available'],
    } as never);

    expect(mocks.find).toHaveBeenCalledWith({
      where: { id: 1 },
      relations: ['available'],
    });
  });
});
