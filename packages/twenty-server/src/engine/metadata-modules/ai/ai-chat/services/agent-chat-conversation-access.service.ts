import { Injectable } from '@nestjs/common';

import { isDefined, isNonEmptyString } from 'twenty-shared/utils';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';
import { AgentRunService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run.service';
import { type AgentChatConversationInput } from 'src/engine/metadata-modules/ai/ai-chat/dtos/agent-chat-conversation.input';
import { AgentChatSharingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-sharing.service';
import { isAgentTurnOpenedByOtherMember } from 'src/engine/metadata-modules/ai/ai-chat/utils/is-agent-turn-opened-by-other-member.util';
import { throwAgentChatThreadNotFound } from 'src/engine/metadata-modules/ai/ai-chat/utils/throw-agent-chat-thread-not-found.util';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { type AgentTurnWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-turn.workspace-entity';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

@Injectable()
export class AgentChatConversationAccessService {
  constructor(
    private readonly sharingService: AgentChatSharingService,
    private readonly agentRunService: AgentRunService,
    @InjectAgentHistoryRepository('agentTurn')
    private readonly turnRepository: AgentHistoryRepository<AgentTurnWorkspaceEntity>,
  ) {}

  async resolveReadableThreadIdOrThrow({
    workspace,
    callerApplication,
    workspaceMemberId,
    conversation: { threadId, agentUniversalIdentifier, threadKey },
  }: {
    workspace: Pick<FlatWorkspace, 'id' | 'workspaceCustomApplicationId'>;
    callerApplication: FlatApplication | undefined;
    workspaceMemberId: string | undefined;
    conversation: Pick<
      AgentChatConversationInput,
      'threadId' | 'agentUniversalIdentifier' | 'threadKey'
    >;
  }): Promise<string> {
    const isNamedByKey =
      isDefined(agentUniversalIdentifier) || isDefined(threadKey);

    if (isDefined(threadId) && !isNamedByKey) {
      if (!isDefined(workspaceMemberId)) {
        return throwAgentChatThreadNotFound();
      }

      await this.sharingService.getReadableThread({
        workspaceId: workspace.id,
        threadId,
        workspaceMemberId,
      });

      return threadId;
    }

    if (
      isDefined(threadId) ||
      !isDefined(callerApplication) ||
      !isNonEmptyString(agentUniversalIdentifier) ||
      !isNonEmptyString(threadKey?.trim())
    ) {
      throw new AiException(
        'Pass either threadId, or agentUniversalIdentifier and threadKey with an application access token',
        AiExceptionCode.INVALID_AGENT_INPUT,
      );
    }

    return this.agentRunService.resolveConversationThreadIdOrThrow({
      workspace,
      callerApplication,
      agentUniversalIdentifier,
      threadKey,
    });
  }

  // the latest turn is the one streaming
  async isLatestTurnOpenedByOtherMember({
    workspaceId,
    threadId,
    workspaceMemberId,
  }: {
    workspaceId: string;
    threadId: string;
    workspaceMemberId: string | undefined;
  }): Promise<boolean> {
    const latestTurn = await this.turnRepository.findOne(workspaceId, {
      where: { threadId },
      order: { createdAt: 'DESC', id: 'DESC' },
    });

    return (
      isDefined(latestTurn?.createdBy) &&
      isAgentTurnOpenedByOtherMember({
        createdBy: latestTurn.createdBy,
        workspaceMemberId,
      })
    );
  }
}
