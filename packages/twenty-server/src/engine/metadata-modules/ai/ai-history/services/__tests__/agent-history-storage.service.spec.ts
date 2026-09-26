import { type DataSource, type QueryRunner } from 'typeorm';
import { ServiceUnavailableException } from '@nestjs/common';

import { AgentHistoryStorageService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-history-storage.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

describe('AgentHistoryStorageService', () => {
  const workspaceId = '20202020-1111-4111-8111-111111111111';
  const runner = {
    hasSchema: jest.fn(),
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    query: jest.fn(),
    manager: {},
    isTransactionActive: true,
  };
  const service = new AgentHistoryStorageService({
    createQueryRunner: () => runner,
  } as unknown as DataSource);

  beforeEach(() => {
    jest.clearAllMocks();
    runner.query.mockReset();
  });

  it('reads the authoritative route on every operation and keeps the fence through completion', async () => {
    runner.query.mockResolvedValueOnce([]).mockResolvedValueOnce([
      {
        workspaceId,
        type: 'CONFIG_VARIABLE',
        value: { storage: 'workspace' },
      },
    ]);
    await service.run(workspaceId, async ({ table }) => {
      expect(table('agentMessage')).toBe(
        `"${getWorkspaceSchemaName(workspaceId)}"."agentMessage"`,
      );
      expect(runner.commitTransaction).not.toHaveBeenCalled();
    });
    expect(runner.query.mock.calls[0][0]).toContain(
      'pg_advisory_xact_lock_shared',
    );
    expect(runner.commitTransaction).toHaveBeenCalledTimes(1);
    expect(runner.release).toHaveBeenCalledTimes(1);
  });

  it('refuses history still stored in core', async () => {
    runner.query
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        { workspaceId, type: 'CONFIG_VARIABLE', value: { storage: 'core' } },
      ]);
    const operation = jest.fn();
    await expect(service.run(workspaceId, operation)).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
    expect(operation).not.toHaveBeenCalled();
    expect(runner.rollbackTransaction).toHaveBeenCalledTimes(1);
  });

  it('does not fall back or execute writes while a migration is incomplete', async () => {
    runner.query.mockResolvedValueOnce([]).mockResolvedValueOnce([
      {
        workspaceId,
        type: 'CONFIG_VARIABLE',
        value: {
          storage: 'core',
          migration: {
            phase: 'copying',
            target: 'workspace',
            tableIndex: 2,
            lastId: null,
          },
        },
      },
    ]);
    const operation = jest.fn();
    await expect(service.run(workspaceId, operation)).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
    expect(operation).not.toHaveBeenCalled();
    expect(runner.rollbackTransaction).toHaveBeenCalledTimes(1);
    expect(runner.release).toHaveBeenCalledTimes(1);
  });

  it('fails closed on a corrupt route', async () => {
    runner.query.mockResolvedValue([{ value: { storage: 'unknown' } }]);
    await expect(
      service.readState(runner as unknown as QueryRunner, workspaceId),
    ).rejects.toThrow('Invalid agent history storage state');
  });
});
