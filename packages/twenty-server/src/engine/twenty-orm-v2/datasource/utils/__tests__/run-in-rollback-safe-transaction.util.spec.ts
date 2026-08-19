import { type Pool, type PoolClient } from 'pg';

import { runInRollbackSafeTransaction } from 'src/engine/twenty-orm-v2/datasource/utils/run-in-rollback-safe-transaction.util';

const buildClient = () => ({
  query: jest.fn().mockResolvedValue({ rows: [] }),
  release: jest.fn(),
});

const buildPool = (client: ReturnType<typeof buildClient>): Pool =>
  ({
    connect: jest.fn().mockResolvedValue(client as unknown as PoolClient),
  }) as unknown as Pool;

describe('runInRollbackSafeTransaction', () => {
  it('should wrap the work in BEGIN/COMMIT and release the client reusable', async () => {
    const client = buildClient();

    const result = await runInRollbackSafeTransaction({
      pool: buildPool(client),
      work: async () => 'done',
    });

    expect(result).toBe('done');
    expect(client.query).toHaveBeenNthCalledWith(1, 'BEGIN');
    expect(client.query).toHaveBeenNthCalledWith(2, 'COMMIT');
    expect(client.release).toHaveBeenCalledWith(false);
  });

  it('should roll back and rethrow the work error', async () => {
    const client = buildClient();
    const workError = new Error('Query read timeout');

    await expect(
      runInRollbackSafeTransaction({
        pool: buildPool(client),
        work: async () => {
          throw workError;
        },
      }),
    ).rejects.toBe(workError);

    expect(client.query).toHaveBeenLastCalledWith('ROLLBACK');
    expect(client.release).toHaveBeenCalledWith(false);
  });

  it('should rethrow the original error, not the rollback error, when ROLLBACK also fails', async () => {
    const client = buildClient();

    client.query.mockImplementation((statement: string) =>
      statement === 'ROLLBACK'
        ? Promise.reject(new Error('Query read timeout'))
        : Promise.resolve({ rows: [] }),
    );
    const workError = new Error('original failure');

    await expect(
      runInRollbackSafeTransaction({
        pool: buildPool(client),
        work: async () => {
          throw workError;
        },
      }),
    ).rejects.toBe(workError);
  });

  it('should destroy the connection instead of pooling it when ROLLBACK fails', async () => {
    const client = buildClient();

    client.query.mockImplementation((statement: string) =>
      statement === 'ROLLBACK'
        ? Promise.reject(new Error('Query read timeout'))
        : Promise.resolve({ rows: [] }),
    );

    await expect(
      runInRollbackSafeTransaction({
        pool: buildPool(client),
        work: async () => {
          throw new Error('original failure');
        },
      }),
    ).rejects.toThrow('original failure');

    expect(client.release).toHaveBeenCalledWith(true);
  });

  it('should rethrow a BEGIN failure and release the client reusable when ROLLBACK succeeds', async () => {
    const client = buildClient();
    const beginError = new Error('BEGIN failed');

    client.query.mockImplementation((statement: string) =>
      statement === 'BEGIN'
        ? Promise.reject(beginError)
        : Promise.resolve({ rows: [] }),
    );
    const work = jest.fn();

    await expect(
      runInRollbackSafeTransaction({ pool: buildPool(client), work }),
    ).rejects.toBe(beginError);

    expect(work).not.toHaveBeenCalled();
    expect(client.query).toHaveBeenLastCalledWith('ROLLBACK');
    expect(client.release).toHaveBeenCalledWith(false);
  });

  it('should roll back when COMMIT fails and release the client reusable', async () => {
    const client = buildClient();
    const commitError = new Error('COMMIT failed');

    client.query.mockImplementation((statement: string) =>
      statement === 'COMMIT'
        ? Promise.reject(commitError)
        : Promise.resolve({ rows: [] }),
    );

    await expect(
      runInRollbackSafeTransaction({
        pool: buildPool(client),
        work: async () => 'done',
      }),
    ).rejects.toBe(commitError);

    expect(client.query).toHaveBeenLastCalledWith('ROLLBACK');
    expect(client.release).toHaveBeenCalledWith(false);
  });
});
