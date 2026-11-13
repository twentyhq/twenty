import { PermissionFlagType } from 'twenty-shared/constants';
import { In } from 'typeorm';

import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';
import { AgentTurnEventPublisherService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-turn-event-publisher.service';

const buildService = (turns: unknown[] = []) => {
  const turnRepository = { find: jest.fn().mockResolvedValue(turns) };
  const workspaceEventBroadcaster = {
    broadcast: jest.fn().mockResolvedValue(undefined),
  };

  return {
    service: new AgentTurnEventPublisherService(
      turnRepository as never,
      workspaceEventBroadcaster as never,
    ),
    turnRepository,
    workspaceEventBroadcaster,
  };
};

describe('AgentTurnEventPublisherService', () => {
  it('broadcasts the stored state of written turns to AI managers', async () => {
    const { service, turnRepository, workspaceEventBroadcaster } = buildService(
      [{ id: 'turn-id', agentId: 'agent-id', status: AgentTurnStatus.RUNNING }],
    );

    await service.publish({
      workspaceId: 'workspace-id',
      type: 'updated',
      turnIds: ['turn-id'],
    });

    expect(turnRepository.find).toHaveBeenCalledTimes(1);
    expect(turnRepository.find).toHaveBeenCalledWith('workspace-id', {
      where: { id: In(['turn-id']) },
      select: ['id', 'agentId', 'status'],
    });
    expect(workspaceEventBroadcaster.broadcast).toHaveBeenCalledTimes(1);
    expect(workspaceEventBroadcaster.broadcast).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      events: [
        {
          type: 'updated',
          entityName: 'agentTurn',
          recordId: 'turn-id',
          properties: {
            after: {
              id: 'turn-id',
              agentId: 'agent-id',
              status: AgentTurnStatus.RUNNING,
            },
          },
          requiredPermissionFlag: PermissionFlagType.AI_SETTINGS,
        },
      ],
    });
  });

  it('broadcasts deleted turns without reading them', async () => {
    const { service, turnRepository, workspaceEventBroadcaster } =
      buildService();

    await service.publish({
      workspaceId: 'workspace-id',
      type: 'deleted',
      turnIds: ['turn-id'],
    });

    expect(turnRepository.find).not.toHaveBeenCalled();
    expect(workspaceEventBroadcaster.broadcast).toHaveBeenCalledTimes(1);
    expect(workspaceEventBroadcaster.broadcast).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      events: [
        expect.objectContaining({
          type: 'deleted',
          recordId: 'turn-id',
          properties: {
            before: { id: 'turn-id', agentId: undefined, status: undefined },
          },
        }),
      ],
    });
  });

  it('does nothing when no turn was written', async () => {
    const { service, turnRepository, workspaceEventBroadcaster } =
      buildService();

    await service.publish({
      workspaceId: 'workspace-id',
      type: 'updated',
      turnIds: [],
    });

    expect(turnRepository.find).not.toHaveBeenCalled();
    expect(workspaceEventBroadcaster.broadcast).not.toHaveBeenCalled();
  });

  it('does not fail the caller when the broadcast fails', async () => {
    const { service, workspaceEventBroadcaster } = buildService([
      { id: 'turn-id', agentId: null, status: AgentTurnStatus.COMPLETED },
    ]);

    workspaceEventBroadcaster.broadcast.mockRejectedValue(new Error('down'));

    await expect(
      service.publish({
        workspaceId: 'workspace-id',
        type: 'created',
        turnIds: ['turn-id'],
      }),
    ).resolves.toBeUndefined();
  });
});
