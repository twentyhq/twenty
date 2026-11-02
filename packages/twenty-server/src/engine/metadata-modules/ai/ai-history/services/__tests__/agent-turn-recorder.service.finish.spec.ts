import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';
import { AgentTurnRecorderService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-turn-recorder.service';

const buildRecorder = () => {
  const query = jest.fn().mockResolvedValue([{ id: 'turn-id' }]);
  const turnRepository = {
    query: (
      _workspaceId: string,
      work: (context: {
        manager: { query: jest.Mock };
        table: (name: string) => string;
      }) => Promise<unknown>,
    ) => work({ manager: { query }, table: (name) => `"workspace"."${name}"` }),
  };

  return {
    recorder: new AgentTurnRecorderService(turnRepository as never),
    query,
  };
};

describe('AgentTurnRecorderService finish', () => {
  it('writes the result in the update that completes the turn', async () => {
    const { recorder, query } = buildRecorder();

    await expect(
      recorder.finish({
        workspaceId: 'workspace-id',
        turnId: 'turn-id',
        status: AgentTurnStatus.COMPLETED,
        modelId: 'model-id',
        result: { response: 'Followed up' },
      }),
    ).resolves.toBe(true);

    expect(query).toHaveBeenCalledTimes(1);

    const [sql, parameters] = query.mock.calls[0];

    expect(sql).toContain('"status" = $2');
    expect(sql).toContain('"result" = $6::jsonb');
    expect(parameters).toEqual([
      'turn-id',
      AgentTurnStatus.COMPLETED,
      null,
      expect.any(String),
      'model-id',
      JSON.stringify({ response: 'Followed up' }),
    ]);
  });

  it('keeps the stream claim condition after the result', async () => {
    const { recorder, query } = buildRecorder();

    await recorder.finish({
      workspaceId: 'workspace-id',
      turnId: 'turn-id',
      status: AgentTurnStatus.COMPLETED,
      result: { score: 3 },
      streamClaim: { threadId: 'thread-id', streamId: 'stream-id' },
    });

    const [sql, parameters] = query.mock.calls[0];

    expect(sql).toContain('"result" = $6::jsonb');
    expect(sql).toContain('WHERE id = $7 AND "activeStreamId" = $8');
    expect(parameters.slice(5)).toEqual([
      JSON.stringify({ score: 3 }),
      'thread-id',
      'stream-id',
    ]);
  });

  it('leaves the result untouched when none is given', async () => {
    const { recorder, query } = buildRecorder();

    await recorder.finish({
      workspaceId: 'workspace-id',
      turnId: 'turn-id',
      status: AgentTurnStatus.FAILED,
      error: { code: 'EXECUTION_FAILED', message: 'The agent failed' },
    });

    const [sql, parameters] = query.mock.calls[0];

    expect(sql).not.toContain('"result"');
    expect(parameters).toHaveLength(5);
  });
});
