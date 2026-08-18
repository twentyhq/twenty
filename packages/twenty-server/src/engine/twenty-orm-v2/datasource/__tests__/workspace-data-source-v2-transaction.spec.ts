import { type Pool, type PoolClient } from 'pg';

import { type ObjectsPermissionsByRoleId } from 'twenty-shared/types';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type WorkspaceInternalContext } from 'src/engine/twenty-orm/interfaces/workspace-internal-context.interface';
import { WorkspaceDataSourceV2 } from 'src/engine/twenty-orm-v2/datasource/workspace-data-source-v2';

const buildDataSource = (client: {
  query: jest.Mock;
  release: jest.Mock;
}): WorkspaceDataSourceV2 =>
  new WorkspaceDataSourceV2({
    pool: {
      connect: jest.fn().mockResolvedValue(client as unknown as PoolClient),
    } as unknown as Pool,
    internalContext: {} as WorkspaceInternalContext,
    authContext: {} as WorkspaceAuthContext,
    objectPermissionsByRoleId: {} as ObjectsPermissionsByRoleId,
  });

const buildClient = () => ({
  query: jest.fn().mockResolvedValue({ rows: [] }),
  release: jest.fn(),
});

describe('WorkspaceDataSourceV2.transaction', () => {
  it('should wrap the work in BEGIN/COMMIT and release the client reusable', async () => {
    const client = buildClient();
    const dataSource = buildDataSource(client);

    const result = await dataSource.transaction(async () => 'done');

    expect(result).toBe('done');
    expect(client.query).toHaveBeenNthCalledWith(1, 'BEGIN');
    expect(client.query).toHaveBeenNthCalledWith(2, 'COMMIT');
    expect(client.release).toHaveBeenCalledWith(false);
  });

  it('should roll back and rethrow the work error', async () => {
    const client = buildClient();
    const dataSource = buildDataSource(client);
    const workError = new Error('Query read timeout');

    await expect(
      dataSource.transaction(async () => {
        throw workError;
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
    const dataSource = buildDataSource(client);
    const workError = new Error('original failure');

    await expect(
      dataSource.transaction(async () => {
        throw workError;
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
    const dataSource = buildDataSource(client);

    await expect(
      dataSource.transaction(async () => {
        throw new Error('original failure');
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
    const dataSource = buildDataSource(client);
    const work = jest.fn();

    await expect(dataSource.transaction(work)).rejects.toBe(beginError);

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
    const dataSource = buildDataSource(client);

    await expect(dataSource.transaction(async () => 'done')).rejects.toBe(
      commitError,
    );

    expect(client.query).toHaveBeenLastCalledWith('ROLLBACK');
    expect(client.release).toHaveBeenCalledWith(false);
  });
});
