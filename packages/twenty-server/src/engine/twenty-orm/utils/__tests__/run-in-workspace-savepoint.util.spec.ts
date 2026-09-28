import { type QueryExecutor } from 'src/engine/twenty-orm/executor/types/query-executor.type';
import { runInWorkspaceSavepoint } from 'src/engine/twenty-orm/utils/run-in-workspace-savepoint.util';

const buildExecutor = () => {
  const statements: string[] = [];
  const executor: QueryExecutor = {
    execute: async ({ text }) => {
      statements.push(text);

      return [];
    },
  };

  return { executor, statements };
};

describe('runInWorkspaceSavepoint', () => {
  it('should release the savepoint and keep the callbacks queued inside it', async () => {
    const { executor, statements } = buildExecutor();
    const earlierCallback = jest.fn();
    const queuedCallback = jest.fn();
    const afterCommitCallbacks = [earlierCallback];

    const result = await runInWorkspaceSavepoint({
      executor,
      savepointName: 'write_check',
      afterCommitCallbacks,
      work: async () => {
        afterCommitCallbacks.push(queuedCallback);

        return 'written';
      },
    });

    expect(result).toBe('written');
    expect(statements).toEqual([
      'SAVEPOINT write_check',
      'RELEASE SAVEPOINT write_check',
    ]);
    expect(afterCommitCallbacks).toEqual([earlierCallback, queuedCallback]);
  });

  it('should roll back and drop only the callbacks queued inside the savepoint', async () => {
    const { executor, statements } = buildExecutor();
    const earlierCallback = jest.fn();
    const afterCommitCallbacks = [earlierCallback];

    await expect(
      runInWorkspaceSavepoint({
        executor,
        savepointName: 'write_check',
        afterCommitCallbacks,
        work: async () => {
          afterCommitCallbacks.push(jest.fn(), jest.fn());

          throw new Error('rule violated');
        },
      }),
    ).rejects.toThrow('rule violated');

    expect(statements).toEqual([
      'SAVEPOINT write_check',
      'ROLLBACK TO SAVEPOINT write_check',
    ]);
    expect(afterCommitCallbacks).toEqual([earlierCallback]);
  });
});
