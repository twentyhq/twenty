import { Inject, Injectable } from '@nestjs/common';

import { RecordSharePrincipalType } from 'twenty-shared/types';
import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';

import { CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { RecordShareStorageService } from 'src/engine/permissions/record-share/services/record-share-storage.service';
import { AiChatAssistantMode } from 'src/engine/core-modules/workspace/enums/ai-chat-assistant-mode.enum';
import { WorkspaceNotFoundDefaultError } from 'src/engine/core-modules/workspace/workspace.exception';
import { AgentChatThreadParticipantService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-participant.service';
import { type AgentChatAssistantDecision } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-assistant-decision.type';
import { type AgentChatAssistantReplyContext } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-assistant-reply-context.type';
import { type AgentChatAudience } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-audience.type';
import { type AgentChatReplyExecutionDecision } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-reply-execution-decision.type';
import { findAgentChatFlatObjectMetadata } from 'src/engine/metadata-modules/ai/ai-chat/utils/find-agent-chat-flat-object-metadata.util';
import { resolveAgentChatAssistantParticipation } from 'src/engine/metadata-modules/ai/ai-chat/utils/resolve-agent-chat-assistant-participation.util';
import { resolveAgentChatReplyDecision } from 'src/engine/metadata-modules/ai/ai-chat/utils/resolve-agent-chat-reply-decision.util';
import { resolveAgentChatReplyExecutionDecision } from 'src/engine/metadata-modules/ai/ai-chat/utils/resolve-agent-chat-reply-execution-decision.util';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

type AssistantPolicyThread = Pick<
  AgentChatThreadWorkspaceEntity,
  | 'id'
  | 'conversationType'
  | 'channelId'
  | 'workspaceMemberId'
  | 'writerWorkspaceMemberIds'
  | 'isAssistantParticipant'
>;

@Injectable()
export class AgentChatAssistantPolicyService {
  @Inject(AgentChatThreadParticipantService)
  private readonly participantService: AgentChatThreadParticipantService;

  @Inject(CoreEntityCacheService)
  private readonly coreEntityCacheService: CoreEntityCacheService;

  @Inject(WorkspaceCacheService)
  private readonly workspaceCacheService: WorkspaceCacheService;

  @Inject(RecordShareStorageService)
  private readonly recordShareStorageService: RecordShareStorageService;

  async resolve({
    workspaceId,
    thread,
    candidateWorkspaceMemberIds = [],
    isAssistantMentioned = false,
    isInitialAssistantParticipant,
    isInitialMessage,
    isReplyRequested = true,
  }: {
    workspaceId: string;
    thread: AssistantPolicyThread;
    candidateWorkspaceMemberIds?: string[];
    isAssistantMentioned?: boolean;
    isInitialAssistantParticipant?: boolean;
    isInitialMessage: boolean;
    isReplyRequested?: boolean;
  }): Promise<AgentChatAssistantDecision> {
    const mode = await this.resolveMode({ workspaceId, thread });
    const audience = await this.resolveAudience({
      workspaceId,
      thread,
      candidateWorkspaceMemberIds,
    });

    const isAssistantParticipant = resolveAgentChatAssistantParticipation({
      mode,
      audience,
      isAssistantParticipant: thread.isAssistantParticipant,
      isAssistantMentioned,
      isInitialAssistantParticipant,
      isInitialMessage,
    });
    const replyDecision = resolveAgentChatReplyDecision({
      mode,
      audience,
      isAssistantParticipant,
      isAssistantMentioned,
      isReplyRequested,
    });

    return { isAssistantParticipant, replyDecision };
  }

  async resolveExecutionDecision({
    workspaceId,
    thread,
    context,
  }: {
    workspaceId: string;
    thread: AssistantPolicyThread;
    context?: AgentChatAssistantReplyContext;
  }): Promise<AgentChatReplyExecutionDecision> {
    const mode = await this.resolveMode({ workspaceId, thread });
    const audience = await this.resolveAudience({
      workspaceId,
      thread,
      candidateWorkspaceMemberIds: [],
    });

    return resolveAgentChatReplyExecutionDecision({
      mode,
      audience,
      isAssistantParticipant: thread.isAssistantParticipant,
      context,
    });
  }

  private async resolveMode({
    workspaceId,
    thread,
  }: {
    workspaceId: string;
    thread: Pick<AssistantPolicyThread, 'conversationType'>;
  }): Promise<AiChatAssistantMode> {
    const workspace = await this.coreEntityCacheService.get(
      'workspaceEntity',
      workspaceId,
    );

    assertIsDefinedOrThrow(workspace, WorkspaceNotFoundDefaultError);

    return thread.conversationType === 'DIRECT_MESSAGE'
      ? (workspace.aiChatDirectMessageAssistantMode ??
          AiChatAssistantMode.MENTION_ONLY)
      : (workspace.aiChatInboxAssistantMode ?? AiChatAssistantMode.AUTOMATIC);
  }

  private async resolveAudience({
    workspaceId,
    thread,
    candidateWorkspaceMemberIds,
  }: {
    workspaceId: string;
    thread: AssistantPolicyThread;
    candidateWorkspaceMemberIds: string[];
  }): Promise<AgentChatAudience> {
    if (thread.conversationType === 'DIRECT_MESSAGE') {
      return 'direct-message';
    }

    if (
      (isDefined(thread.conversationType) &&
        thread.conversationType !== 'STANDARD') ||
      isDefined(thread.channelId) ||
      !isDefined(thread.workspaceMemberId)
    ) {
      return 'conversation';
    }

    const { flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
      ]);
    const threadObjectMetadata = findAgentChatFlatObjectMetadata(
      flatObjectMetadataMaps,
      'agentChatThread',
    );

    if (!isDefined(threadObjectMetadata)) {
      return 'conversation';
    }

    const [shares, memberCount] = await Promise.all([
      this.recordShareStorageService.findByRecordIds({
        workspaceId,
        objectMetadataId: threadObjectMetadata.id,
        recordIds: [thread.id],
      }),
      this.participantService.countMembers({
        workspaceId,
        threadId: thread.id,
        additionalWorkspaceMemberIds: [
          thread.workspaceMemberId,
          ...(thread.writerWorkspaceMemberIds ?? []),
          ...candidateWorkspaceMemberIds,
        ],
      }),
    ]);
    const hasSharedAudience = shares.some(
      ({ principalType, principalId }) =>
        principalType !== RecordSharePrincipalType.WORKSPACE_MEMBER ||
        principalId !== thread.workspaceMemberId,
    );

    return !hasSharedAudience && memberCount <= 1
      ? 'assistant-chat'
      : 'conversation';
  }
}
