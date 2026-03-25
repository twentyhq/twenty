import { deleteUsingPagination } from 'src/modules/messaging/message-cleaner/utils/delete-using-pagination.util';

describe('deleteUsingPagination', () => {
  it('should delete items using pagination', async () => {
    const workspaceId = 'workspace123';
    const batchSize = 10;
    const getterPaginated = jest
      .fn()
      .mockResolvedValueOnce(['id1', 'id2'])
      .mockResolvedValueOnce([]);
    const deleter = jest.fn();
    const transactionManager = undefined;

    await deleteUsingPagination(
      workspaceId,
      batchSize,
      getterPaginated,
      deleter,
      transactionManager,
    );

    expect(getterPaginated).toHaveBeenNthCalledWith(
      1,
      batchSize,
      0,
      workspaceId,
      transactionManager,
    );
    expect(getterPaginated).toHaveBeenNthCalledWith(
      2,
      batchSize,
      0,
      workspaceId,
      transactionManager,
    );
    expect(deleter).toHaveBeenNthCalledWith(
      1,
      ['id1', 'id2'],
      workspaceId,
      transactionManager,
    );
    expect(deleter).toHaveBeenCalledTimes(1);
  });
});
