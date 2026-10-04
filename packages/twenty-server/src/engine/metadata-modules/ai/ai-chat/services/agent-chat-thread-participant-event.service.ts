import { Injectable } from '@nestjs/common';

import { PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { type AgentChatThreadParticipantDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/agent-chat-thread-participant.dto';
import { WorkspaceEventBroadcaster } from 'src/engine/subscriptions/workspace-event-broadcaster/workspace-event-broadcaster.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

// A participant row is one member's private inbox state, which record events
// never deliver, so it is sent to that member's event streams only
@Injectable()
export class AgentChatThreadParticipantEventService {
  constructor(
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceEventBroadcaster: WorkspaceEventBroadcaster,
  ) {}

  async emitParticipantUpdated({
    workspaceId,
    workspaceMemberId,
    participant,
  }: {
    workspaceId: string;
    workspaceMemberId: string;
    participant: AgentChatThreadParticipantDTO;
  }): Promise<void> {
    const { flatWorkspaceMemberMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatWorkspaceMemberMaps',
      ]);
    const userId = flatWorkspaceMemberMaps.byId[workspaceMemberId]?.userId;
    const userWorkspaceId = isDefined(userId)
      ? flatWorkspaceMemberMaps.userWorkspaceIdByUserId[userId]
      : undefined;

    if (!isDefined(userWorkspaceId)) {
      return;
    }

    await this.workspaceEventBroadcaster.broadcast({
      workspaceId,
      events: [
        {
          type: 'updated',
          entityName: 'agentChatThreadParticipant',
          recordId: participant.threadId,
          properties: { after: { ...participant } },
          recipientUserWorkspaceIds: [userWorkspaceId],
          requiredPermissionFlag: PermissionFlagType.AI,
        },
      ],
    });
  }
}
