import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';
import { AgentTurnRecorderService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-turn-recorder.service';

const buildService = ({
  hasUpgradedAgentHistory,
}: {
  hasUpgradedAgentHistory: boolean;
}) => {
  const query = jest.fn().mockResolvedValue([{ id: 'row-id' }]);
  const turnRepository = {
    query: jest.fn((_workspaceId, work) =>
      work({ manager: { query }, table: (name: string) => `"ws"."${name}"` }),
    ),
    findOne: jest.fn().mockResolvedValue({ id: 'turn-id', status: 'failed' }),
  };
  const service = new AgentTurnRecorderService(
    turnRepository as never,
    {
      hasUpgradedAgentHistory: jest
        .fn()
        .mockResolvedValue(hasUpgradedAgentHistory),
    } as never,
    { emit: jest.fn() } as never,
  );

  return { service, query, turnRepository };
};

const getStatements = (query: jest.Mock) =>
  query.mock.calls.map(([statement]) => statement as string).join('\n');

describe('AgentTurnRecorderService before the 2.46 commands reach a workspace', () => {
  const workspaceId = 'workspace-id';

  it('releases a stream claim without touching turn columns it lacks', async () => {
    const { service, query } = buildService({
      hasUpgradedAgentHistory: false,
    });

    await service.releaseStreamClaim({
      workspaceId,
      threadId: 'thread-id',
      streamId: 'stream-id',
      endRunningTurn: { status: AgentTurnStatus.FAILED },
    });

    expect(getStatements(query)).not.toContain('"status"');
    expect(query).toHaveBeenCalledWith(expect.any(String), [
      'thread-id',
      'stream-id',
    ]);
  });

  it('still checks the stream claim when a turn starts or finishes', async () => {
    const { service, query } = buildService({
      hasUpgradedAgentHistory: false,
    });
    const streamClaim = { threadId: 'thread-id', streamId: 'stream-id' };

    await service.markRunning({ workspaceId, turnId: 'turn-id', streamClaim });
    await service.finish({
      workspaceId,
      turnId: 'turn-id',
      status: AgentTurnStatus.COMPLETED,
      streamClaim,
    });

    const statements = getStatements(query);

    expect(statements).toContain('"activeStreamId" = $3');
    expect(statements).not.toMatch(/"status"|"startedAt"|"createdBySource"/);
  });

  it('records usage on the thread only', async () => {
    const { service, query } = buildService({
      hasUpgradedAgentHistory: false,
    });

    await service.recordUsage({
      workspaceId,
      turnId: 'turn-id',
      threadId: 'thread-id',
      usage: {
        inputTokens: 1,
        outputTokens: 1,
        cacheReadTokens: 0,
        cacheCreationTokens: 0,
        inputCredits: 1,
        outputCredits: 1,
      },
    });

    const statements = getStatements(query);

    expect(statements).toContain('"ws"."agentChatThread"');
    expect(statements).not.toContain('"ws"."agentTurn"');
  });

  it('has no waiting turn to end and no failed turn to report', async () => {
    const { service, query, turnRepository } = buildService({
      hasUpgradedAgentHistory: false,
    });

    await service.endWaitingTurn({
      workspaceId,
      messageId: 'message-id',
      status: AgentTurnStatus.COMPLETED,
    });

    expect(query).not.toHaveBeenCalled();
    expect(
      await service.findLatestTurnError({ workspaceId, threadId: 'thread-id' }),
    ).toBeNull();
    expect(turnRepository.findOne).not.toHaveBeenCalled();
  });

  it('ends the running turn once the workspace is upgraded', async () => {
    const { service, query } = buildService({ hasUpgradedAgentHistory: true });

    await service.releaseStreamClaim({
      workspaceId,
      threadId: 'thread-id',
      streamId: 'stream-id',
      endRunningTurn: { status: AgentTurnStatus.FAILED },
    });

    expect(getStatements(query)).toContain('"ws"."agentTurn"');
    expect(query).toHaveBeenCalledWith(expect.any(String), [
      'thread-id',
      'stream-id',
      AgentTurnStatus.FAILED,
      null,
    ]);
  });
});
