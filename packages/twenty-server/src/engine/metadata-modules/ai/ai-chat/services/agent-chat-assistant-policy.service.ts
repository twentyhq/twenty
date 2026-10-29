import { Inject, Injectable } from '@nestjs/common';

import { RecordSharePrincipalType } from 'twenty-shared/types';
import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';

import { CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { RecordShareStorageService } from 'src/engine/core-modules/record-share/services/record-share-storage.service';
import { AiChatAssistantMode } from 'src/engine/core-modules/workspace/enums/ai-chat-assistant-mode.enum';
import { WorkspaceNotFoundDefaultError } from 'src/engine/core-modules/workspace/workspace.exception';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AgentChatThreadParticipantService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-participant.service';
import { findAgentChatFlatObjectMetadata } from 'src/engine/metadata-modules/ai/ai-chat/utils/find-agent-chat-flat-object-metadata.util';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

type AssistantPolicyThread = Pick<
  AgentChatThreadWorkspaceEntity,
  | 'id'
  | 'conversationType'
  | 'channelId'
  | 'workspaceMemberId'
  | 'writerWorkspaceMemberIds'
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
    workspace,
  }: {
    workspaceId: string;
    thread: AssistantPolicyThread;
    candidateWorkspaceMemberIds?: string[];
    workspace?: WorkspaceEntity;
  }): Promise<{
    mode: AiChatAssistantMode;
    isDirectAssistantChat: boolean;
    isDirectMessage: boolean;
  }> {
    const currentWorkspace =
      workspace ??
      (await this.coreEntityCacheService.get('workspaceEntity', workspaceId));

    assertIsDefinedOrThrow(currentWorkspace, WorkspaceNotFoundDefaultError);

    const isDirectMessage = thread.conversationType === 'DIRECT_MESSAGE';
    const mode = isDirectMessage
      ? (currentWorkspace.aiChatDirectMessageAssistantMode ??
        AiChatAssistantMode.MENTION_ONLY)
      : (currentWorkspace.aiChatInboxAssistantMode ??
        AiChatAssistantMode.AUTOMATIC);

    if (
      isDirectMessage ||
      (isDefined(thread.conversationType) &&
        thread.conversationType !== 'STANDARD') ||
      isDefined(thread.channelId) ||
      !isDefined(thread.workspaceMemberId)
    ) {
      return { mode, isDirectAssistantChat: false, isDirectMessage };
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
      return { mode, isDirectAssistantChat: false, isDirectMessage };
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
    const isDirectAssistantChat = !hasSharedAudience && memberCount <= 1;

    return { mode, isDirectAssistantChat, isDirectMessage };
  }
}
