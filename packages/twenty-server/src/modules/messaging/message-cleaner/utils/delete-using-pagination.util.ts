import { EntityManager } from 'typeorm';

export const deleteUsingPagination = async (
  workspaceId: string,
  batchSize: number,
  getterPaginated: (
    limit: number,
    offset: number,
    workspaceId: string,
    transactionManager?: EntityManager,
  ) => Promise<string[]>,
  deleter: (
    ids: string[],
    workspaceId: string,
    transactionManager?: EntityManager,
  ) => Promise<void>,
  transactionManager?: EntityManager,
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
