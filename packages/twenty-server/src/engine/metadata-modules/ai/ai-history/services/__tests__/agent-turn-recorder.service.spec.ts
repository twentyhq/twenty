import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';
import { AgentTurnRecorderService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-turn-recorder.service';

const buildService = (queryResult: unknown[]) => {
  const manager = { query: jest.fn().mockResolvedValue(queryResult) };
  const turnRepository = {
    query: jest.fn(
      (
        _workspaceId: string,
        work: (context: {
          manager: typeof manager;
          table: (name: string) => string;
        }) => unknown,
      ) => work({ manager, table: (name) => name }),
    ),
  };
  const turnEventPublisherService = {
    publish: jest.fn().mockResolvedValue(undefined),
  };

  return {
    service: new AgentTurnRecorderService(
      turnRepository as never,
      turnEventPublisherService as never,
    ),
    turnEventPublisherService,
  };
};

describe('AgentTurnRecorderService', () => {
  it('publishes the turn it marked running', async () => {
    const { service, turnEventPublisherService } = buildService([
      { id: 'turn-id' },
    ]);

    await expect(
      service.markRunning({ workspaceId: 'workspace-id', turnId: 'turn-id' }),
    ).resolves.toBe(true);

    expect(turnEventPublisherService.publish).toHaveBeenCalledTimes(1);
    expect(turnEventPublisherService.publish).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      type: 'updated',
      turnIds: ['turn-id'],
    });
  });

  it('publishes nothing for a turn another stream took over', async () => {
    const { service, turnEventPublisherService } = buildService([]);

    await expect(
      service.finish({
        workspaceId: 'workspace-id',
        turnId: 'turn-id',
        status: AgentTurnStatus.COMPLETED,
        streamClaim: { threadId: 'thread-id', streamId: 'stream-id' },
      }),
    ).resolves.toBe(false);

    expect(turnEventPublisherService.publish).toHaveBeenCalledTimes(1);
    expect(turnEventPublisherService.publish).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      type: 'updated',
      turnIds: [],
    });
  });

  it('publishes the turns a released stream ended', async () => {
    const { service, turnEventPublisherService } = buildService([
      { id: 'thread-id', endedTurnIds: ['turn-id'] },
    ]);

    await expect(
      service.releaseStreamClaim({
        workspaceId: 'workspace-id',
        threadId: 'thread-id',
        streamId: 'stream-id',
        endRunningTurn: { status: AgentTurnStatus.CANCELLED },
      }),
    ).resolves.toBe(true);

    expect(turnEventPublisherService.publish).toHaveBeenCalledTimes(1);
    expect(turnEventPublisherService.publish).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      type: 'updated',
      turnIds: ['turn-id'],
    });
  });
});
