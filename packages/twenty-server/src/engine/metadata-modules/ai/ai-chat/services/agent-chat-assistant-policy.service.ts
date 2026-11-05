import { Injectable } from '@nestjs/common';

import { RecordSharePrincipalType } from 'twenty-shared/types';
import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';

import { CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { AgentChatThreadConversationType } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-chat-thread-conversation-type.enum';
import { RecordPermissionReadOrmService } from 'src/engine/permissions/record-permission-orm/services/record-permission-read-orm.service';
import { AiChatAssistantMode } from 'src/engine/core-modules/workspace/enums/ai-chat-assistant-mode.enum';
import { WorkspaceNotFoundDefaultError } from 'src/engine/core-modules/workspace/workspace.exception';
import { AgentChatThreadParticipantService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-participant.service';
import { type AgentChatAssistantDecision } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-assistant-decision.type';
import { type AgentChatAssistantReplyContext } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-assistant-reply-context.type';
import { type AgentChatReplyExecutionDecision } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-reply-execution-decision.enum';
import { AgentChatAudience } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-audience.enum';
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
  constructor(
    private readonly participantService: AgentChatThreadParticipantService,
    private readonly coreEntityCacheService: CoreEntityCacheService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly recordPermissionReadOrmService: RecordPermissionReadOrmService,
  ) {}

  async resolveAssistantMessageDecision({
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
    const workspaceAssistantMode = await this.resolveWorkspaceAssistantMode({
      workspaceId,
      thread,
    });
    const chatAudience = await this.resolveChatAudience({
      workspaceId,
      thread,
      candidateWorkspaceMemberIds,
    });
    const isAssistantParticipant = resolveAgentChatAssistantParticipation({
      mode: workspaceAssistantMode,
      audience: chatAudience,
      isAssistantParticipant: thread.isAssistantParticipant,
      isAssistantMentioned,
      isInitialAssistantParticipant,
      isInitialMessage,
    });
    const replyDecision = resolveAgentChatReplyDecision({
      mode: workspaceAssistantMode,
      audience: chatAudience,
      isAssistantParticipant,
      isAssistantMentioned,
      isReplyRequested,
    });

    return { isAssistantParticipant, replyDecision };
  }

  async resolveReplyExecutionDecision({
    workspaceId,
    thread,
    context,
  }: {
    workspaceId: string;
    thread: AssistantPolicyThread;
    context?: AgentChatAssistantReplyContext;
  }): Promise<AgentChatReplyExecutionDecision> {
    const workspaceAssistantMode = await this.resolveWorkspaceAssistantMode({
      workspaceId,
      thread,
    });
    const chatAudience = await this.resolveChatAudience({
      workspaceId,
      thread,
      candidateWorkspaceMemberIds: [],
    });

    return resolveAgentChatReplyExecutionDecision({
      mode: workspaceAssistantMode,
      audience: chatAudience,
      isAssistantParticipant: thread.isAssistantParticipant,
      context,
    });
  }

  private async resolveWorkspaceAssistantMode({
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

    return thread.conversationType ===
      AgentChatThreadConversationType.DIRECT_MESSAGE
      ? (workspace.aiChatDirectMessageAssistantMode ??
          AiChatAssistantMode.MENTION_ONLY)
      : (workspace.aiChatInboxAssistantMode ?? AiChatAssistantMode.AUTOMATIC);
  }

  private async resolveChatAudience({
    workspaceId,
    thread,
    candidateWorkspaceMemberIds,
  }: {
    workspaceId: string;
    thread: AssistantPolicyThread;
    candidateWorkspaceMemberIds: string[];
  }): Promise<AgentChatAudience> {
    if (
      thread.conversationType === AgentChatThreadConversationType.DIRECT_MESSAGE
    ) {
      return AgentChatAudience.DIRECT_MESSAGE;
    }

    if (
      (isDefined(thread.conversationType) &&
        thread.conversationType !== AgentChatThreadConversationType.STANDARD) ||
      isDefined(thread.channelId) ||
      !isDefined(thread.workspaceMemberId)
    ) {
      return AgentChatAudience.CONVERSATION;
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
      return AgentChatAudience.CONVERSATION;
    }

    const [threadShares, audienceMemberCount] = await Promise.all([
      this.recordPermissionReadOrmService.findRecordShares({
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
    const hasSharedAudience = threadShares.some(
      ({ principalType, principalId }) =>
        principalType !== RecordSharePrincipalType.WORKSPACE_MEMBER ||
        principalId !== thread.workspaceMemberId,
    );

    return !hasSharedAudience && audienceMemberCount <= 1
      ? AgentChatAudience.ASSISTANT_CHAT
      : AgentChatAudience.CONVERSATION;
  }
}
