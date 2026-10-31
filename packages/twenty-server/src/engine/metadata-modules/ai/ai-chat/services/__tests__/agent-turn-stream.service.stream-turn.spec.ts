import { AgentTurnStreamService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-turn-stream.service';
import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';

const buildService = (finish: jest.Mock) =>
  new AgentTurnStreamService(
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    { finish, recordUsage: jest.fn() } as never,
    {} as never,
  );

const streamTurnWithoutClaim = ({
  service,
  turnError,
}: {
  service: AgentTurnStreamService;
  turnError: Error;
}) =>
  service.streamTurn({
    workspaceId: 'workspace-id',
    claim: null,
    turnId: 'turn-id',
    startTurn: () => Promise.reject(turnError),
    completeTurn: jest.fn(),
    isBackgroundRun: true,
  });

describe('AgentTurnStreamService streamTurn without a claim', () => {
  it('records the turn as failed', async () => {
    const finish = jest.fn().mockResolvedValue(true);
    const turnError = new Error('Provider unavailable');

    await expect(
      streamTurnWithoutClaim({ service: buildService(finish), turnError }),
    ).rejects.toBe(turnError);

    expect(finish).toHaveBeenCalledWith(
      expect.objectContaining({
        turnId: 'turn-id',
        status: AgentTurnStatus.FAILED,
      }),
    );
  });

  it('fails with the turn error when recording the failure fails', async () => {
    const turnError = new Error('Provider unavailable');
    const service = buildService(
      jest.fn().mockRejectedValue(new Error('Database unavailable')),
    );

    jest.spyOn(service['logger'], 'warn').mockImplementation();

    await expect(streamTurnWithoutClaim({ service, turnError })).rejects.toBe(
      turnError,
    );
  });
});
