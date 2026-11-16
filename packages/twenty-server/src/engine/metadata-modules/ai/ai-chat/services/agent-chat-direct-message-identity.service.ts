import { AgentChatDirectMessageConversationPrivacyService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-chat-direct-message-conversation-privacy.service';
import { Injectable } from '@nestjs/common';
import { AgentChatThreadConversationType } from 'twenty-shared/ai';

import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatWorkspaceMemberMaps } from 'src/engine/core-modules/user/types/flat-workspace-member-maps.type';
import { AgentChatThreadService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread.service';
import { normalizeAgentChatDirectMessagePairOrThrow } from 'src/engine/metadata-modules/ai/ai-chat/utils/normalize-agent-chat-direct-message-pair-or-throw.util';
import { throwAgentChatThreadNotFound } from 'src/engine/metadata-modules/ai/ai-chat/utils/throw-agent-chat-thread-not-found.util';
import { type AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

type DirectMessagePair = ReturnType<
  typeof normalizeAgentChatDirectMessagePairOrThrow
>;

@Injectable()
export class AgentChatDirectMessageIdentityService {
  constructor(
    @InjectAgentHistoryRepository('agentChatThread')
    private readonly threadRepository: AgentHistoryRepository<AgentChatThreadWorkspaceEntity>,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly directMessageConversationPrivacyService: AgentChatDirectMessageConversationPrivacyService,
    private readonly chatThreadService: AgentChatThreadService,
  ) {}

  async open({
    workspaceId,
    firstWorkspaceMemberId,
    secondWorkspaceMemberId,
  }: {
    workspaceId: string;
    firstWorkspaceMemberId: string;
    secondWorkspaceMemberId: string;
  }): Promise<string> {
    const pair = normalizeAgentChatDirectMessagePairOrThrow({
      firstWorkspaceMemberId,
      secondWorkspaceMemberId,
    });
    const { flatWorkspaceMemberMaps, featureFlagsMap } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatWorkspaceMemberMaps',
        'featureFlagsMap',
      ]);

    if (!featureFlagsMap[FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED]) {
      return throwAgentChatThreadNotFound();
    }

    this.assertMembersAvailableOrThrow({ flatWorkspaceMemberMaps, pair });

    const threadId = await this.getOrCreate({
      workspaceId,
      firstWorkspaceMemberId,
      secondWorkspaceMemberId,
    });
    const thread = await this.threadRepository.findOneOrFail(workspaceId, {
      where: { id: threadId },
    });

    if (isDefined(thread.deletedAt)) {
      await this.chatThreadService.restoreDirectMessageThread({
        workspaceId,
        thread,
      });
    }

    return threadId;
  }

  async getOrCreate({
    workspaceId,
    ...members
  }: {
    workspaceId: string;
    firstWorkspaceMemberId: string;
    secondWorkspaceMemberId: string;
  }): Promise<string> {
    const pair = normalizeAgentChatDirectMessagePairOrThrow(members);

    await this.assertDirectMessageIdentityFeatureFlagEnabledOrThrow(
      workspaceId,
    );

    const existingThread = await this.threadRepository.findOne(workspaceId, {
      where: pair,
      select: ['id'],
    });

    if (isDefined(existingThread)) {
      return existingThread.id;
    }

    const { flatWorkspaceMemberMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatWorkspaceMemberMaps',
      ]);

    this.assertMembersAvailableOrThrow({ flatWorkspaceMemberMaps, pair });

    const createdThreadId =
      await this.workspaceOrmManager.executeTransactionInWorkspaceContext(
        async (transactionScope) => {
          const { identifiers } = await transactionScope
            .getRepositoryWithoutPermissionChecks<AgentChatThreadWorkspaceEntity>(
              'agentChatThread',
              { shouldSkipEventEmission: true },
            )
            .insert(
              {
                conversationType:
                  AgentChatThreadConversationType.DIRECT_MESSAGE,
                ...pair,
                isAssistantParticipant: false,
              },
              { onConflictDoNothing: true },
            );

          const createdThreadId = identifiers[0]?.id;

          if (!isDefined(createdThreadId)) {
            return undefined;
          }

          // TODO @bosiraphael let's make sure the sharing by a participant is not possible (if private, do not share with share permission), if RLS, nothing todo
          await this.directMessageConversationPrivacyService.makeConversationRecordsPrivateToPair(
            {
              workspaceId,
              transactionScope,
              pair: [
                pair.directMessageFirstWorkspaceMemberId,
                pair.directMessageSecondWorkspaceMemberId,
              ],
              conversationObjectName: 'agentChatThread',
              conversationRecordIds: [createdThreadId],
            },
          );

          return createdThreadId;
        },
        buildSystemAuthContext(workspaceId),
        { lite: true },
      );

    if (isDefined(createdThreadId)) {
      return createdThreadId;
    }

    const concurrentThread = await this.threadRepository.findOne(workspaceId, {
      where: pair,
      select: ['id'],
    });

    return concurrentThread?.id ?? throwAgentChatThreadNotFound();
  }

  private async assertDirectMessageIdentityFeatureFlagEnabledOrThrow(
    workspaceId: string,
  ): Promise<void> {
    const { featureFlagsMap } = await this.workspaceCacheService.getOrRecompute(
      workspaceId,
      ['featureFlagsMap'],
    );

    if (
      !featureFlagsMap[
        FeatureFlagKey.IS_AGENT_CHAT_DIRECT_MESSAGE_IDENTITY_ENABLED
      ]
    ) {
      throw new AiException(
        'Direct messages are unavailable until this workspace finishes upgrading',
        AiExceptionCode.CHAT_UPGRADE_IN_PROGRESS,
      );
    }
  }

  private assertMembersAvailableOrThrow({
    flatWorkspaceMemberMaps,
    pair,
  }: {
    flatWorkspaceMemberMaps: Pick<
      FlatWorkspaceMemberMaps,
      'byId' | 'userWorkspaceIdByUserId'
    >;
    pair: DirectMessagePair;
  }): void {
    for (const workspaceMemberId of [
      pair.directMessageFirstWorkspaceMemberId,
      pair.directMessageSecondWorkspaceMemberId,
    ]) {
      const member = flatWorkspaceMemberMaps.byId[workspaceMemberId];

      if (
        !isDefined(member) ||
        isDefined(member.deletedAt) ||
        !isDefined(
          flatWorkspaceMemberMaps.userWorkspaceIdByUserId[member.userId],
        )
      ) {
        throwAgentChatThreadNotFound();
      }
    }
  }
}
