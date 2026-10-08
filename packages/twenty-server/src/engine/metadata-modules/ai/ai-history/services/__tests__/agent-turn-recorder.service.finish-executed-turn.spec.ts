import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';
import { AgentTurnRecorderService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-turn-recorder.service';

const TURN_USAGE = {
  inputTokens: 10,
  outputTokens: 5,
  cacheReadTokens: 0,
  cacheCreationTokens: 0,
  inputCredits: 100,
  outputCredits: 50,
};

const buildService = () => {
  const service = new AgentTurnRecorderService(
    {} as never,
    { hasUpgradedAgentHistory: jest.fn().mockResolvedValue(true) } as never,
    {} as never,
  );
  const recordUsage = jest
    .spyOn(service, 'recordUsage')
    .mockResolvedValue(undefined);
  const finish = jest.spyOn(service, 'finish').mockResolvedValue(true);

  return { service, recordUsage, finish };
};

const turn = {
  workspaceId: 'workspace-id',
  threadId: 'thread-id',
  turnId: 'turn-id',
};

describe('AgentTurnRecorderService.finishExecutedTurn', () => {
  it('records the usage and completes the turn', async () => {
    const { service, recordUsage, finish } = buildService();

    await service.finishExecutedTurn({
      ...turn,
      execution: { modelId: 'model-id', turnUsage: TURN_USAGE },
    });

    expect(recordUsage).toHaveBeenCalledWith({ ...turn, usage: TURN_USAGE });
    expect(finish).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      turnId: 'turn-id',
      modelId: 'model-id',
      status: AgentTurnStatus.COMPLETED,
    });
  });

  it('leaves a turn that asked a question waiting', async () => {
    const { service, finish } = buildService();

    await service.finishExecutedTurn({
      ...turn,
      execution: { turnUsage: TURN_USAGE },
      isAwaitingAnswer: true,
    });

    expect(finish).toHaveBeenCalledWith(
      expect.objectContaining({ status: AgentTurnStatus.WAITING_FOR_INPUT }),
    );
  });

  it('fails a turn that ran out of credits', async () => {
    const { service, finish } = buildService();

    await service.finishExecutedTurn({
      ...turn,
      execution: { turnUsage: TURN_USAGE, hasNoMoreAvailableCredits: true },
      isAwaitingAnswer: true,
    });

    expect(finish).toHaveBeenCalledWith(
      expect.objectContaining({
        status: AgentTurnStatus.FAILED,
        error: expect.objectContaining({ code: 'CREDITS_EXHAUSTED' }),
      }),
    );
  });

  it('still ends the turn when its usage cannot be written', async () => {
    const { service, recordUsage, finish } = buildService();

    recordUsage.mockRejectedValue(new Error('database down'));

    await service.finishExecutedTurn({
      ...turn,
      execution: { turnUsage: TURN_USAGE },
      error: { code: 'EXECUTION_FAILED', message: 'Reply not saved.' },
    });

    expect(finish).toHaveBeenCalledWith(
      expect.objectContaining({
        status: AgentTurnStatus.FAILED,
        error: { code: 'EXECUTION_FAILED', message: 'Reply not saved.' },
      }),
    );
  });
});
