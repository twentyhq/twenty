import { Injectable } from '@nestjs/common';

import { isDefined, isNonEmptyString } from 'twenty-shared/utils';

import { type ApplicationCallerOperation } from 'src/engine/core-modules/application/types/application-caller-operation.type';
import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';
import { AgentRunService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run.service';
import { buildAgentRunStreamChannelId } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/build-agent-run-stream-channel-id.util';
import { type AgentChatConversationInput } from 'src/engine/metadata-modules/ai/ai-chat/dtos/agent-chat-conversation.input';
import { type AgentChatEventInput } from 'src/engine/metadata-modules/ai/ai-chat/dtos/agent-chat-event.input';
import { type AgentChatChannel } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-channel.type';
import { AgentChatSharingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-sharing.service';
import { createAgentChatLiveEventFilter } from 'src/engine/metadata-modules/ai/ai-chat/utils/create-agent-chat-live-event-filter.util';
import { isAgentTurnOpenedByOtherMember } from 'src/engine/metadata-modules/ai/ai-chat/utils/is-agent-turn-opened-by-other-member.util';
import { throwAgentChatThreadNotFound } from 'src/engine/metadata-modules/ai/ai-chat/utils/throw-agent-chat-thread-not-found.util';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { type AgentTurnWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-turn.workspace-entity';
import { maskStreamChunkOfTurnActedByOthers } from 'src/engine/metadata-modules/ai/ai-history/utils/mask-stream-chunk-of-turn-acted-by-others.util';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

type ConversationReader = {
  workspace: Pick<FlatWorkspace, 'id' | 'workspaceCustomApplicationId'>;
  callerApplication: ApplicationCallerOperation['callingApplication'];
  workspaceMemberId: string | undefined;
};

type ConversationViewer = {
  workspaceId: string;
  threadId: string;
  workspaceMemberId: string | undefined;
};

@Injectable()
export class AgentChatConversationAccessService {
  constructor(
    private readonly sharingService: AgentChatSharingService,
    private readonly agentRunService: AgentRunService,
    @InjectAgentHistoryRepository('agentTurn')
    private readonly turnRepository: AgentHistoryRepository<AgentTurnWorkspaceEntity>,
  ) {}

  async resolveReadableChannelOrThrow({
    source: { runId, ...conversation },
    ...reader
  }: ConversationReader & {
    source: Pick<
      AgentChatEventInput,
      'threadId' | 'agentUniversalIdentifier' | 'threadKey' | 'runId'
    >;
  }): Promise<AgentChatChannel> {
    if (!isDefined(runId)) {
      return {
        kind: 'thread',
        channelId: await this.resolveReadableThreadIdOrThrow({
          ...reader,
          conversation,
        }),
      };
    }

    if (
      !isDefined(reader.callerApplication) ||
      Object.values(conversation).some(isDefined)
    ) {
      throw new AiException(
        'Pass runId alone, with an application access token',
        AiExceptionCode.INVALID_AGENT_INPUT,
      );
    }

    return {
      kind: 'run',
      channelId: buildAgentRunStreamChannelId({
        applicationId: reader.callerApplication.id,
        runId,
      }),
    };
  }

  async resolveReadableThreadIdOrThrow({
    workspace,
    callerApplication,
    workspaceMemberId,
    conversation: { threadId, agentUniversalIdentifier, threadKey },
  }: ConversationReader & {
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

  async getVisibleCatchupChunks({
    chunks,
    ...viewer
  }: ConversationViewer & {
    chunks: Record<string, unknown>[];
  }): Promise<Record<string, unknown>[]> {
    if (!(await this.isLatestTurnOpenedByOtherMember(viewer))) {
      return chunks;
    }

    return chunks.map(maskStreamChunkOfTurnActedByOthers);
  }

  createLiveEventFilter(viewer: ConversationViewer) {
    return createAgentChatLiveEventFilter({
      isStreamingTurnHidden: () => this.isLatestTurnOpenedByOtherMember(viewer),
    });
  }

  // the latest turn is the one streaming
  private async isLatestTurnOpenedByOtherMember({
    workspaceId,
    threadId,
    workspaceMemberId,
  }: ConversationViewer): Promise<boolean> {
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
