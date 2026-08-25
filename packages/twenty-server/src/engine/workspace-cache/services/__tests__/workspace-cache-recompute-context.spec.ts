import { type DataSource, type EntityTarget } from 'typeorm';

import { WorkspaceCacheRecomputeContext } from 'src/engine/workspace-cache/services/workspace-cache-recompute-context';
import { entityFetchRequirement } from 'src/engine/workspace-cache/utils/entity-fetch-requirement.util';

class FirstTestEntity {
  id: string;
  workspaceId: string;
  name: string;
}

class SecondTestEntity {
  id: string;
  workspaceId: string;
}

const WORKSPACE_ID = '20202020-0000-4000-8000-000000000000';

describe('WorkspaceCacheRecomputeContext', () => {
  const setup = () => {
    const findMocksByEntity = new Map<EntityTarget<object>, jest.Mock>([
      [
        FirstTestEntity,
        jest
          .fn()
          .mockResolvedValue([{ id: 'first-row', workspaceId: WORKSPACE_ID }]),
      ],
      [
        SecondTestEntity,
        jest
          .fn()
          .mockResolvedValue([{ id: 'second-row', workspaceId: WORKSPACE_ID }]),
      ],
    ]);

    const dataSource = {
      getRepository: jest.fn((entityTarget: EntityTarget<object>) => ({
        metadata: {
          name:
            entityTarget === FirstTestEntity
              ? 'FirstTestEntity'
              : 'SecondTestEntity',
        },
        find: findMocksByEntity.get(entityTarget),
      })),
    } as unknown as DataSource;

    return {
      recomputeContext: new WorkspaceCacheRecomputeContext(
        dataSource,
        WORKSPACE_ID,
      ),
      findMocksByEntity,
    };
  };

  it('fetches all workspace rows including soft-deleted ones', async () => {
    const { recomputeContext, findMocksByEntity } = setup();

    await recomputeContext.resolveFetchRequirements([
      entityFetchRequirement(FirstTestEntity),
    ]);

    expect(recomputeContext.getRows(FirstTestEntity)).toEqual([
      { id: 'first-row', workspaceId: WORKSPACE_ID },
    ]);
    expect(findMocksByEntity.get(FirstTestEntity)).toHaveBeenCalledWith({
      where: { workspaceId: WORKSPACE_ID },
      withDeleted: true,
    });
  });

  it('merges requirements into one query per entity with the union of declared columns', async () => {
    const { recomputeContext, findMocksByEntity } = setup();

    await recomputeContext.resolveFetchRequirements([
      entityFetchRequirement(FirstTestEntity, ['id']),
      entityFetchRequirement(FirstTestEntity, ['id', 'name']),
      entityFetchRequirement(SecondTestEntity, ['id']),
    ]);

    const firstFindMock = findMocksByEntity.get(FirstTestEntity)!;

    expect(firstFindMock).toHaveBeenCalledTimes(1);
    expect(firstFindMock.mock.calls[0][0].select).toHaveLength(2);
    expect(firstFindMock.mock.calls[0][0].select).toEqual(
      expect.arrayContaining(['id', 'name']),
    );
    expect(findMocksByEntity.get(SecondTestEntity)).toHaveBeenCalledTimes(1);
  });

  it('drops the column selection once any requirement needs full rows', async () => {
    const { recomputeContext, findMocksByEntity } = setup();

    await recomputeContext.resolveFetchRequirements([
      entityFetchRequirement(FirstTestEntity, ['id']),
      entityFetchRequirement(FirstTestEntity),
    ]);

    const findMock = findMocksByEntity.get(FirstTestEntity)!;

    expect(findMock).toHaveBeenCalledTimes(1);
    expect(findMock.mock.calls[0][0].select).toBeUndefined();
  });

  it('treats an already-covered later resolution as a no-op', async () => {
    const { recomputeContext, findMocksByEntity } = setup();

    await recomputeContext.resolveFetchRequirements([
      entityFetchRequirement(FirstTestEntity, ['id', 'name']),
    ]);
    const firstRows = recomputeContext.getRows(FirstTestEntity);

    await recomputeContext.resolveFetchRequirements([
      entityFetchRequirement(FirstTestEntity, ['id']),
    ]);

    expect(findMocksByEntity.get(FirstTestEntity)).toHaveBeenCalledTimes(1);
    expect(recomputeContext.getRows(FirstTestEntity)).toBe(firstRows);
  });

  it('refetches with the widened union when a later resolution is not covered', async () => {
    const { recomputeContext, findMocksByEntity } = setup();

    await recomputeContext.resolveFetchRequirements([
      entityFetchRequirement(FirstTestEntity, ['id']),
    ]);
    await recomputeContext.resolveFetchRequirements([
      entityFetchRequirement(FirstTestEntity, ['name']),
    ]);

    const findMock = findMocksByEntity.get(FirstTestEntity)!;

    expect(findMock).toHaveBeenCalledTimes(2);
    expect(findMock.mock.calls[1][0].select).toHaveLength(2);
    expect(findMock.mock.calls[1][0].select).toEqual(
      expect.arrayContaining(['id', 'name']),
    );
  });

  it('shares one query across concurrent resolutions of the same entity', async () => {
    const { recomputeContext, findMocksByEntity } = setup();

    await Promise.all([
      recomputeContext.resolveFetchRequirements([
        entityFetchRequirement(FirstTestEntity, ['id']),
      ]),
      recomputeContext.resolveFetchRequirements([
        entityFetchRequirement(FirstTestEntity, ['id']),
      ]),
    ]);

    expect(findMocksByEntity.get(FirstTestEntity)).toHaveBeenCalledTimes(1);
  });

  it('keeps previously resolved rows readable while a widening refetch is in flight', async () => {
    const { recomputeContext, findMocksByEntity } = setup();
    const findMock = findMocksByEntity.get(FirstTestEntity)!;
    const initialRows = [{ id: 'first-generation', workspaceId: WORKSPACE_ID }];
    const widenedRows = [
      { id: 'first-generation', name: 'widened', workspaceId: WORKSPACE_ID },
    ];

    findMock
      .mockResolvedValueOnce(initialRows)
      .mockResolvedValueOnce(widenedRows);

    await recomputeContext.resolveFetchRequirements([
      entityFetchRequirement(FirstTestEntity, ['id']),
    ]);

    const wideningPromise = recomputeContext.resolveFetchRequirements([
      entityFetchRequirement(FirstTestEntity, ['id', 'name']),
    ]);

    expect(recomputeContext.getRows(FirstTestEntity)).toBe(initialRows);

    await wideningPromise;

    expect(findMock).toHaveBeenCalledTimes(2);
    expect(recomputeContext.getRows(FirstTestEntity)).toBe(widenedRows);
  });

  it('throws when reading an entity no requirement declared', async () => {
    const { recomputeContext } = setup();

    await recomputeContext.resolveFetchRequirements([
      entityFetchRequirement(FirstTestEntity),
    ]);

    expect(() => recomputeContext.getRows(SecondTestEntity)).toThrow(
      /SecondTestEntity.*fetchRequirements/,
    );
  });
});
