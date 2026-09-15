import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';

export const readBackendState = async (
  backendPid: number,
): Promise<string | undefined> => {
  const activities: { state: string }[] = await getCoreRepository<WorkspaceEntity>(
    WorkspaceEntity,
  ).manager.query('SELECT state FROM pg_stat_activity WHERE pid = $1', [
    backendPid,
  ]);

  return activities[0]?.state;
};
