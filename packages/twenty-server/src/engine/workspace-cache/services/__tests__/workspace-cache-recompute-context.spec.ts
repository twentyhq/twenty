import { type DataSource, type EntityTarget } from 'typeorm';

import { WorkspaceCacheRecomputeContext } from 'src/engine/workspace-cache/services/workspace-cache-recompute-context';

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

  it('dispatches a single query with the union of declared column sets', async () => {
    const { recomputeContext, findMocksByEntity } = setup();

    await Promise.all([
      recomputeContext.findAll(FirstTestEntity, ['id']),
      recomputeContext.findAll(FirstTestEntity, ['id', 'name']),
    ]);

    const findMock = findMocksByEntity.get(FirstTestEntity)!;

    expect(findMock).toHaveBeenCalledTimes(1);
    expect(findMock.mock.calls[0][0].select).toHaveLength(2);
    expect(findMock.mock.calls[0][0].select).toEqual(
      expect.arrayContaining(['id', 'name']),
    );
  });

  it('drops the column selection once any caller needs full rows', async () => {
    const { recomputeContext, findMocksByEntity } = setup();

    await Promise.all([
      recomputeContext.findAll(FirstTestEntity, ['id']),
      recomputeContext.findAll(FirstTestEntity),
    ]);

    const findMock = findMocksByEntity.get(FirstTestEntity)!;

    expect(findMock).toHaveBeenCalledTimes(1);
    expect(findMock.mock.calls[0][0].select).toBeUndefined();
  });

  it('serves a late request from the dispatched fetch when its columns are covered', async () => {
    const { recomputeContext, findMocksByEntity } = setup();

    const firstRows = await recomputeContext.findAll(FirstTestEntity, [
      'id',
      'name',
    ]);
    const lateRows = await recomputeContext.findAll(FirstTestEntity, ['id']);

    expect(findMocksByEntity.get(FirstTestEntity)).toHaveBeenCalledTimes(1);
    expect(lateRows).toBe(firstRows);
  });

  it('runs a second query for a late request needing uncovered columns', async () => {
    const { recomputeContext, findMocksByEntity } = setup();

    await recomputeContext.findAll(FirstTestEntity, ['id']);
    await recomputeContext.findAll(FirstTestEntity, ['id', 'name']);

    const findMock = findMocksByEntity.get(FirstTestEntity)!;

    expect(findMock).toHaveBeenCalledTimes(2);
    expect(findMock.mock.calls[1][0].select).toEqual(
      expect.arrayContaining(['id', 'name']),
    );
  });

  it('coalesces concurrent late uncovered requests into one follow-up query', async () => {
    const { recomputeContext, findMocksByEntity } = setup();

    await recomputeContext.findAll(FirstTestEntity, ['id']);

    const [secondRoundRows, thirdRoundRows] = await Promise.all([
      recomputeContext.findAll(FirstTestEntity, ['name']),
      recomputeContext.findAll(FirstTestEntity, ['id', 'name']),
    ]);
    const coveredLateRows = await recomputeContext.findAll(FirstTestEntity, [
      'id',
    ]);

    const findMock = findMocksByEntity.get(FirstTestEntity)!;

    expect(findMock).toHaveBeenCalledTimes(2);
    expect(findMock.mock.calls[1][0].select).toEqual(
      expect.arrayContaining(['id', 'name']),
    );
    expect(thirdRoundRows).toBe(secondRoundRows);
    expect(coveredLateRows).toBe(secondRoundRows);
  });
});
