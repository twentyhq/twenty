import { Injectable, Logger } from '@nestjs/common';

import { PermissionFlagType } from 'twenty-shared/constants';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { formatErrorWithCause } from 'src/engine/metadata-modules/ai/ai-chat/utils/format-error-with-cause.util';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { type AgentTurnWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-turn.workspace-entity';
import { type WorkspaceBroadcastEvent } from 'src/engine/subscriptions/workspace-event-broadcaster/types/workspace-broadcast-event.type';
import { WorkspaceEventBroadcaster } from 'src/engine/subscriptions/workspace-event-broadcaster/workspace-event-broadcaster.service';

export const AGENT_TURN_BROADCAST_ENTITY_NAME = 'agentTurn';

type BroadcastTurn = Pick<AgentTurnWorkspaceEntity, 'id'> &
  Partial<Pick<AgentTurnWorkspaceEntity, 'agentId' | 'threadId' | 'status'>>;

// Turn writes skip record events and turns are listed by AI permission, not record access
@Injectable()
export class AgentTurnEventPublisherService {
  private readonly logger = new Logger(AgentTurnEventPublisherService.name);

  constructor(
    @InjectAgentHistoryRepository('agentTurn')
    private readonly turnRepository: AgentHistoryRepository<AgentTurnWorkspaceEntity>,
    private readonly workspaceEventBroadcaster: WorkspaceEventBroadcaster,
  ) {}

  async publish({
    workspaceId,
    type,
    turnIds,
  }: {
    workspaceId: string;
    type: WorkspaceBroadcastEvent['type'];
    turnIds: string[];
  }): Promise<void> {
    if (!isNonEmptyArray(turnIds)) {
      return;
    }

    await this.broadcastSafely({
      workspaceId,
      buildEvents: async () =>
        type === 'deleted'
          ? turnIds.map((turnId) => this.buildEvent(type, { id: turnId }))
          : (
              await this.findTurns({ workspaceId, where: { id: In(turnIds) } })
            ).map((turn) => this.buildEvent(type, turn)),
    });
  }

  // A thread's deletion or restore changes whether its runs can be opened
  async publishTurnsOfThreads({
    workspaceId,
    threadIds,
  }: {
    workspaceId: string;
    threadIds: string[];
  }): Promise<void> {
    if (!isNonEmptyArray(threadIds)) {
      return;
    }

    await this.broadcastSafely({
      workspaceId,
      buildEvents: async () =>
        (
          await this.findTurns({
            workspaceId,
            where: { threadId: In(threadIds) },
          })
        ).map((turn) => this.buildEvent('updated', turn)),
    });
  }

  // The database cascade has already removed the turns, so each event names the thread they belonged to
  async publishTurnsDestroyedWithThreads({
    workspaceId,
    threadIds,
  }: {
    workspaceId: string;
    threadIds: string[];
  }): Promise<void> {
    if (!isNonEmptyArray(threadIds)) {
      return;
    }

    await this.broadcastSafely({
      workspaceId,
      buildEvents: async () =>
        threadIds.map((threadId) =>
          this.buildEvent('deleted', { id: threadId, threadId }),
        ),
    });
  }

  // The write is already committed, so a lost event must not fail the caller
  private async broadcastSafely({
    workspaceId,
    buildEvents,
  }: {
    workspaceId: string;
    buildEvents: () => Promise<WorkspaceBroadcastEvent[]>;
  }): Promise<void> {
    try {
      await this.workspaceEventBroadcaster.broadcast({
        workspaceId,
        events: await buildEvents(),
      });
    } catch (error) {
      this.logger.warn(
        `Could not publish turn events in workspace ${workspaceId}: ${formatErrorWithCause(error)}`,
      );
    }
  }

  private buildEvent(
    type: WorkspaceBroadcastEvent['type'],
    turn: BroadcastTurn,
  ): WorkspaceBroadcastEvent {
    const record = {
      id: turn.id,
      agentId: turn.agentId,
      threadId: turn.threadId,
      status: turn.status,
    };

    return {
      type,
      entityName: AGENT_TURN_BROADCAST_ENTITY_NAME,
      recordId: turn.id,
      properties: type === 'deleted' ? { before: record } : { after: record },
      requiredPermissionFlag: PermissionFlagType.AI_SETTINGS,
    };
  }

  private findTurns({
    workspaceId,
    where,
  }: {
    workspaceId: string;
    where: Partial<Record<'id' | 'threadId', ReturnType<typeof In>>>;
  }): Promise<BroadcastTurn[]> {
    return this.turnRepository.find(workspaceId, {
      where,
      select: ['id', 'agentId', 'threadId', 'status'],
    });
  }
}
