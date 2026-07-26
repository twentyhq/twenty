import { type ObjectLiteral, type Repository } from 'typeorm';

import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

type SyncChannel = ObjectLiteral & {
  workspaceId: string;
  syncStage: string;
  syncStageStartedAt: Date | null;
};

type FindWorkspaceIdsWithStaleSyncParams<T extends SyncChannel> = {
  repository: Repository<T>;
  syncStages: T['syncStage'][];
  staleTimeout: number;
};

export const findWorkspaceIdsWithStaleSync = async <T extends SyncChannel>({
  repository,
  syncStages,
  staleTimeout,
}: FindWorkspaceIdsWithStaleSyncParams<T>): Promise<string[]> => {
  const staleBefore = new Date(Date.now() - staleTimeout);
  const staleWorkspaces = await repository
    .createQueryBuilder('channel')
    .innerJoin('channel.workspace', 'workspace')
    .select('channel.workspaceId', 'workspaceId')
    .distinct(true)
    .where('workspace.activationStatus = :activationStatus', {
      activationStatus: WorkspaceActivationStatus.ACTIVE,
    })
    .andWhere('workspace.deletedAt IS NULL')
    .andWhere('channel.syncStage IN (:...syncStages)', { syncStages })
    .andWhere(
      '(channel.syncStageStartedAt IS NULL OR channel.syncStageStartedAt < :staleBefore)',
      { staleBefore },
    )
    .getRawMany<{ workspaceId: string }>();

  return staleWorkspaces.map(({ workspaceId }) => workspaceId);
};
