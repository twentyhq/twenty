import { type DataSource } from 'typeorm';

import { AgentHistoryWorkspaceStorageService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-history-workspace-storage.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

const WORKSPACE_ID = '20202020-1111-4111-8111-111111111111';

describe('AgentHistoryWorkspaceStorageService', () => {
  const runner = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    query: jest.fn(),
    manager: {},
    isTransactionActive: true,
  };
  const service = new AgentHistoryWorkspaceStorageService({
    createQueryRunner: () => runner,
  } as unknown as DataSource);

  beforeEach(() => {
    jest.clearAllMocks();
    runner.query.mockResolvedValue([{ ready: true }]);
  });

  it('uses workspace tables after checking upgrade readiness', async () => {
    const result = await service.run(WORKSPACE_ID, async ({ table }) => {
      expect(table('agentMessage')).toBe(
        `"${getWorkspaceSchemaName(WORKSPACE_ID)}"."agentMessage"`,
      );
      expect(runner.commitTransaction).not.toHaveBeenCalled();
      return 'saved';
    });

    expect(result).toBe('saved');
    expect(runner.query).toHaveBeenCalledTimes(2);
    expect(runner.commitTransaction).toHaveBeenCalledTimes(1);
    expect(runner.release).toHaveBeenCalledTimes(1);
  });

  it.each([[], undefined])(
    'rejects incomplete upgrades before running domain writes (%s)',
    async (ready) => {
      runner.query.mockResolvedValueOnce([]).mockResolvedValueOnce(ready ?? []);
      const work = jest.fn();
      await expect(service.run(WORKSPACE_ID, work)).rejects.toThrow(
        'finishes upgrading',
      );
      expect(work).not.toHaveBeenCalled();
      expect(runner.rollbackTransaction).toHaveBeenCalled();
    },
  );

  it('rolls back domain writes on failure', async () => {
    await expect(
      service.run(WORKSPACE_ID, async () => {
        throw new Error('write failed');
      }),
    ).rejects.toThrow('write failed');

    expect(runner.rollbackTransaction).toHaveBeenCalledTimes(1);
    expect(runner.commitTransaction).not.toHaveBeenCalled();
    expect(runner.release).toHaveBeenCalledTimes(1);
  });

  it('rejects an empty workspace scope before opening a transaction', async () => {
    await expect(service.run('', jest.fn())).rejects.toMatchObject({
      code: 'INVALID_WORKSPACE',
    });
    expect(runner.connect).not.toHaveBeenCalled();
  });
});
