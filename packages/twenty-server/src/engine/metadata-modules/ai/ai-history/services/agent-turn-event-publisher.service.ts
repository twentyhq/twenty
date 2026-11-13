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

// Turn writes skip record events, and turns are listed to whoever manages AI
// rather than by record access, so their changes are broadcast from here
@Injectable()
export class AgentTurnEventPublisherService {
  private readonly logger = new Logger(AgentTurnEventPublisherService.name);

  constructor(
    @InjectAgentHistoryRepository('agentTurn')
    private readonly turnRepository: AgentHistoryRepository<AgentTurnWorkspaceEntity>,
    private readonly workspaceEventBroadcaster: WorkspaceEventBroadcaster,
  ) {}

  // The write is already committed, so a lost event must not fail the caller
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

    try {
      await this.workspaceEventBroadcaster.broadcast({
        workspaceId,
        events:
          type === 'deleted'
            ? turnIds.map((turnId) => this.buildEvent(type, { id: turnId }))
            : (await this.findTurns({ workspaceId, turnIds })).map((turn) =>
                this.buildEvent(type, turn),
              ),
      });
    } catch (error) {
      this.logger.warn(
        `Could not publish ${type} turns ${turnIds.join(', ')}: ${formatErrorWithCause(error)}`,
      );
    }
  }

  private buildEvent(
    type: WorkspaceBroadcastEvent['type'],
    turn: Pick<AgentTurnWorkspaceEntity, 'id'> &
      Partial<Pick<AgentTurnWorkspaceEntity, 'agentId' | 'status'>>,
  ): WorkspaceBroadcastEvent {
    const record = {
      id: turn.id,
      agentId: turn.agentId,
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
    turnIds,
  }: {
    workspaceId: string;
    turnIds: string[];
  }): Promise<Pick<AgentTurnWorkspaceEntity, 'id' | 'agentId' | 'status'>[]> {
    return this.turnRepository.find(workspaceId, {
      where: { id: In(turnIds) },
      select: ['id', 'agentId', 'status'],
    });
  }
}
