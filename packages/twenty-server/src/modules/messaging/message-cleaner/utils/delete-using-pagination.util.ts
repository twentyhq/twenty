import { type WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';

export const deleteUsingPagination = async (
  workspaceId: string,
  batchSize: number,
  getterPaginated: (
    limit: number,
    offset: number,
    workspaceId: string,
    transactionManager?: WorkspaceEntityManager,
  ) => Promise<string[]>,
  deleter: (
    ids: string[],
    workspaceId: string,
    transactionManager?: WorkspaceEntityManager,
  ) => Promise<void>,
  transactionManager?: WorkspaceEntityManager,
) => {
  let hasMoreData = true;

  while (hasMoreData) {
    const idsToDelete = await getterPaginated(
      batchSize,
      0,
      workspaceId,
      transactionManager,
    );

    if (idsToDelete.length > 0) {
      await deleter(idsToDelete, workspaceId, transactionManager);
    } else {
      hasMoreData = false;
    }
  }
};
