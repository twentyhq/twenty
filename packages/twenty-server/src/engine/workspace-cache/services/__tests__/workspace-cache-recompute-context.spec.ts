import { type DataSource, type EntityTarget } from 'typeorm';

import { WorkspaceCacheRecomputeContext } from 'src/engine/workspace-cache/services/workspace-cache-recompute-context';

class FirstTestEntity {
  id: string;
  workspaceId: string;
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

    const rows = await recomputeContext.findAll(FirstTestEntity);

    expect(rows).toEqual([{ id: 'first-row', workspaceId: WORKSPACE_ID }]);
    expect(findMocksByEntity.get(FirstTestEntity)).toHaveBeenCalledWith({
      where: { workspaceId: WORKSPACE_ID },
      withDeleted: true,
    });
  });

  it('runs a single query per entity across concurrent and sequential callers', async () => {
    const { recomputeContext, findMocksByEntity } = setup();

    const [firstRows, secondRows] = await Promise.all([
      recomputeContext.findAll(FirstTestEntity),
      recomputeContext.findAll(FirstTestEntity),
    ]);
    const thirdRows = await recomputeContext.findAll(FirstTestEntity);

    expect(findMocksByEntity.get(FirstTestEntity)).toHaveBeenCalledTimes(1);
    expect(secondRows).toBe(firstRows);
    expect(thirdRows).toBe(firstRows);
  });

  it('fetches distinct entities independently', async () => {
    const { recomputeContext, findMocksByEntity } = setup();

    const [firstRows, secondRows] = await Promise.all([
      recomputeContext.findAll(FirstTestEntity),
      recomputeContext.findAll(SecondTestEntity),
    ]);

    expect(firstRows).toEqual([{ id: 'first-row', workspaceId: WORKSPACE_ID }]);
    expect(secondRows).toEqual([
      { id: 'second-row', workspaceId: WORKSPACE_ID },
    ]);
    expect(findMocksByEntity.get(FirstTestEntity)).toHaveBeenCalledTimes(1);
    expect(findMocksByEntity.get(SecondTestEntity)).toHaveBeenCalledTimes(1);
  });
});
