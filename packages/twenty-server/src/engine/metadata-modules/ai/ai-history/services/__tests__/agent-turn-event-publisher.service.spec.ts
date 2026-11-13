import { Test } from '@nestjs/testing';

import { PermissionFlagType } from 'twenty-shared/constants';
import { In } from 'typeorm';

import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';
import { getAgentHistoryRepositoryToken } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { AgentTurnEventPublisherService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-turn-event-publisher.service';
import { WorkspaceEventBroadcaster } from 'src/engine/subscriptions/workspace-event-broadcaster/workspace-event-broadcaster.service';

type TurnFixture = {
  id: string;
  agentId: string | null;
  threadId: string | null;
  status: AgentTurnStatus;
};

const TURN_SELECT = ['id', 'agentId', 'threadId', 'status'];

const buildService = async (turns: TurnFixture[] = []) => {
  const turnRepository = { find: jest.fn().mockResolvedValue(turns) };
  const workspaceEventBroadcaster = {
    broadcast: jest.fn().mockResolvedValue(undefined),
  };

  const module = await Test.createTestingModule({
    providers: [
      AgentTurnEventPublisherService,
      {
        provide: getAgentHistoryRepositoryToken('agentTurn'),
        useValue: turnRepository,
      },
      {
        provide: WorkspaceEventBroadcaster,
        useValue: workspaceEventBroadcaster,
      },
    ],
  }).compile();

  return {
    service: module.get(AgentTurnEventPublisherService),
    turnRepository,
    workspaceEventBroadcaster,
  };
};

const RUNNING_TURN: TurnFixture = {
  id: 'turn-id',
  agentId: 'agent-id',
  threadId: 'thread-id',
  status: AgentTurnStatus.RUNNING,
};

describe('AgentTurnEventPublisherService', () => {
  it('broadcasts the stored state of written turns to AI managers', async () => {
    const { service, turnRepository, workspaceEventBroadcaster } =
      await buildService([RUNNING_TURN]);

    await service.publish({
      workspaceId: 'workspace-id',
      type: 'updated',
      turnIds: ['turn-id'],
    });

    expect(turnRepository.find).toHaveBeenCalledTimes(1);
    expect(turnRepository.find).toHaveBeenCalledWith('workspace-id', {
      where: { id: In(['turn-id']) },
      select: TURN_SELECT,
    });
    expect(workspaceEventBroadcaster.broadcast).toHaveBeenCalledTimes(1);
    expect(workspaceEventBroadcaster.broadcast).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      events: [
        {
          type: 'updated',
          entityName: 'agentTurn',
          recordId: 'turn-id',
          properties: { after: RUNNING_TURN },
          requiredPermissionFlag: PermissionFlagType.AI_SETTINGS,
        },
      ],
    });
  });

  it('broadcasts deleted turns without reading them', async () => {
    const { service, turnRepository, workspaceEventBroadcaster } =
      await buildService();

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
            before: {
              id: 'turn-id',
              agentId: undefined,
              threadId: undefined,
              status: undefined,
            },
          },
        }),
      ],
    });
  });

  it('broadcasts the turns of soft-deleted or restored threads', async () => {
    const { service, turnRepository, workspaceEventBroadcaster } =
      await buildService([RUNNING_TURN]);

    await service.publishTurnsOfThreads({
      workspaceId: 'workspace-id',
      threadIds: ['thread-id'],
    });

    expect(turnRepository.find).toHaveBeenCalledTimes(1);
    expect(turnRepository.find).toHaveBeenCalledWith('workspace-id', {
      where: { threadId: In(['thread-id']) },
      select: TURN_SELECT,
    });
    expect(workspaceEventBroadcaster.broadcast).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      events: [
        expect.objectContaining({ type: 'updated', recordId: 'turn-id' }),
      ],
    });
  });

  it('signals a destroyed conversation instead of its removed turns', async () => {
    const { service, turnRepository, workspaceEventBroadcaster } =
      await buildService();

    await service.publishThreadsDestroyed({
      workspaceId: 'workspace-id',
      threadIds: ['thread-id'],
    });

    expect(turnRepository.find).not.toHaveBeenCalled();
    expect(workspaceEventBroadcaster.broadcast).toHaveBeenCalledTimes(1);
    expect(workspaceEventBroadcaster.broadcast).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      events: [
        {
          type: 'deleted',
          entityName: 'agentTurnThread',
          recordId: 'thread-id',
          properties: { before: { id: 'thread-id' } },
          requiredPermissionFlag: PermissionFlagType.AI_SETTINGS,
        },
      ],
    });
  });

  it('does nothing when no turn was written', async () => {
    const { service, turnRepository, workspaceEventBroadcaster } =
      await buildService();

    await service.publish({
      workspaceId: 'workspace-id',
      type: 'updated',
      turnIds: [],
    });

    expect(turnRepository.find).not.toHaveBeenCalled();
    expect(workspaceEventBroadcaster.broadcast).not.toHaveBeenCalled();
  });

  it('does not fail the caller when the broadcast fails', async () => {
    const { service, workspaceEventBroadcaster } = await buildService([
      RUNNING_TURN,
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
