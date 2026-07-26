import { type Repository } from 'typeorm';

import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { findWorkspaceIdsWithStaleSync } from 'src/modules/connected-account/utils/find-workspace-ids-with-stale-sync.util';

type TestSyncChannel = {
  workspaceId: string;
  syncStage: string;
  syncStageStartedAt: Date | null;
};

describe('findWorkspaceIdsWithStaleSync', () => {
  const now = new Date('2026-07-26T12:00:00.000Z');
  const staleTimeout = 30 * 60 * 1000;
  const syncStages = ['SCHEDULED', 'ONGOING'];

  let queryBuilder: {
    innerJoin: jest.Mock;
    select: jest.Mock;
    distinct: jest.Mock;
    where: jest.Mock;
    andWhere: jest.Mock;
    getRawMany: jest.Mock;
  };
  let repository: Repository<TestSyncChannel>;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(now);

    queryBuilder = {
      innerJoin: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      distinct: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getRawMany: jest
        .fn()
        .mockResolvedValue([
          { workspaceId: 'workspace-1' },
          { workspaceId: 'workspace-2' },
        ]),
    };
    repository = {
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
    } as unknown as Repository<TestSyncChannel>;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('finds active workspaces with a stale sync channel', async () => {
    const workspaceIds = await findWorkspaceIdsWithStaleSync({
      repository,
      syncStages,
      staleTimeout,
    });

    expect(workspaceIds).toEqual(['workspace-1', 'workspace-2']);
    expect(repository.createQueryBuilder).toHaveBeenCalledWith('channel');
    expect(queryBuilder.innerJoin).toHaveBeenCalledWith(
      'channel.workspace',
      'workspace',
    );
    expect(queryBuilder.select).toHaveBeenCalledWith(
      'channel.workspaceId',
      'workspaceId',
    );
    expect(queryBuilder.distinct).toHaveBeenCalledWith(true);
    expect(queryBuilder.where).toHaveBeenCalledWith(
      'workspace.activationStatus = :activationStatus',
      {
        activationStatus: WorkspaceActivationStatus.ACTIVE,
      },
    );
    expect(queryBuilder.andWhere).toHaveBeenNthCalledWith(
      1,
      'workspace.deletedAt IS NULL',
    );
    expect(queryBuilder.andWhere).toHaveBeenNthCalledWith(
      2,
      'channel.syncStage IN (:...syncStages)',
      { syncStages },
    );
    expect(queryBuilder.andWhere).toHaveBeenNthCalledWith(
      3,
      '(channel.syncStageStartedAt IS NULL OR channel.syncStageStartedAt < :staleBefore)',
      {
        staleBefore: new Date(now.getTime() - staleTimeout),
      },
    );
  });
});
