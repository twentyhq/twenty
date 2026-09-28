import { type QueryExecutor } from 'src/engine/twenty-orm/executor/types/query-executor.type';

export const runInWorkspaceSavepoint = async <T>({
  executor,
  savepointName,
  afterCommitCallbacks,
  work,
}: {
  executor: QueryExecutor;
  savepointName: string;
  afterCommitCallbacks: Array<() => void | Promise<void>>;
  work: () => Promise<T>;
}): Promise<T> => {
  const queuedCallbackCount = afterCommitCallbacks.length;

  await executor.execute({ text: `SAVEPOINT ${savepointName}`, values: [] });

  try {
    const result = await work();

    await executor.execute({
      text: `RELEASE SAVEPOINT ${savepointName}`,
      values: [],
    });

    return result;
  } catch (error) {
    await executor.execute({
      text: `ROLLBACK TO SAVEPOINT ${savepointName}`,
      values: [],
    });
    afterCommitCallbacks.splice(queuedCallbackCount);

    throw error;
  }
};
