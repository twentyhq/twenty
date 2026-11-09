import { Injectable } from '@nestjs/common';

import { AgentChatThreadConversationType } from 'twenty-shared/ai';
import { FeatureFlagKey } from 'twenty-shared/types';
import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';

import { CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { RecordSharingPermissionsService } from 'src/engine/permissions/record-sharing-permissions.service';
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
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

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
    private readonly recordSharingPermissionsService: RecordSharingPermissionsService,
  ) {}

  async resolveAssistantMessageDecisionOrThrow({
    workspaceId,
    thread,
    candidateWorkspaceMemberIds = [],
    isAssistantMentioned = false,
    isInitialAssistantParticipant,
    isInitialMessage,
    isReplyRequested = true,
    hasRequestedRecipients = false,
    isUncommittedThread = false,
  }: {
    workspaceId: string;
    thread: AssistantPolicyThread;
    candidateWorkspaceMemberIds?: string[];
    isAssistantMentioned?: boolean;
    isInitialAssistantParticipant?: boolean;
    isInitialMessage: boolean;
    isReplyRequested?: boolean;
    hasRequestedRecipients?: boolean;
    isUncommittedThread?: boolean;
  }): Promise<AgentChatAssistantDecision> {
    const workspaceAssistantMode = await this.resolveWorkspaceAssistantMode({
      workspaceId,
      thread,
    });
    const chatAudience = await this.resolveChatAudience({
      workspaceId,
      thread,
      candidateWorkspaceMemberIds,
      isUncommittedThread,
    });
    const isAssistantOptOutLeftAlone =
      isInitialMessage &&
      !isInitialAssistantParticipant &&
      !isAssistantMentioned &&
      hasRequestedRecipients &&
      chatAudience === AgentChatAudience.ASSISTANT_CHAT;

    if (isAssistantOptOutLeftAlone) {
      throw new AiException(
        'None of the requested recipients can reply in this chat',
        AiExceptionCode.CHAT_RECIPIENTS_CANNOT_REPLY,
      );
    }

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

    if (
      thread.conversationType === AgentChatThreadConversationType.DIRECT_MESSAGE
    ) {
      return this.resolveDirectMessageAssistantMode({
        workspaceId,
        configuredMode: workspace.aiChatDirectMessageAssistantMode,
      });
    }

    return workspace.aiChatInboxAssistantMode ?? AiChatAssistantMode.AUTOMATIC;
  }

  private async resolveDirectMessageAssistantMode({
    workspaceId,
    configuredMode,
  }: {
    workspaceId: string;
    configuredMode: AiChatAssistantMode;
  }): Promise<AiChatAssistantMode> {
    const { featureFlagsMap } = await this.workspaceCacheService.getOrRecompute(
      workspaceId,
      ['featureFlagsMap'],
    );

    if (!featureFlagsMap[FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED]) {
      return AiChatAssistantMode.NEVER;
    }

    return configuredMode;
  }

  private async resolveChatAudience({
    workspaceId,
    thread,
    candidateWorkspaceMemberIds,
    isUncommittedThread = false,
  }: {
    workspaceId: string;
    thread: AssistantPolicyThread;
    candidateWorkspaceMemberIds: string[];
    isUncommittedThread?: boolean;
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

    if (isUncommittedThread) {
      const audienceMemberIds = new Set([
        thread.workspaceMemberId,
        ...candidateWorkspaceMemberIds,
      ]);

      return audienceMemberIds.size <= 1
        ? AgentChatAudience.ASSISTANT_CHAT
        : AgentChatAudience.CONVERSATION;
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

    const [hasSharedAudience, audienceMemberCount] = await Promise.all([
      this.recordSharingPermissionsService.isRecordSharedBeyondMember({
        workspaceId,
        objectMetadataId: threadObjectMetadata.id,
        recordId: thread.id,
        workspaceMemberId: thread.workspaceMemberId,
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

    return !hasSharedAudience && audienceMemberCount <= 1
      ? AgentChatAudience.ASSISTANT_CHAT
      : AgentChatAudience.CONVERSATION;
  }
}
