import { Injectable } from '@nestjs/common';

import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatWorkspaceMemberMaps } from 'src/engine/core-modules/user/types/flat-workspace-member-maps.type';
import { findAgentChatFlatObjectMetadata } from 'src/engine/metadata-modules/ai/ai-chat/utils/find-agent-chat-flat-object-metadata.util';
import { normalizeAgentChatDirectMessagePairOrThrow } from 'src/engine/metadata-modules/ai/ai-chat/utils/normalize-agent-chat-direct-message-pair-or-throw.util';
import { throwAgentChatThreadNotFound } from 'src/engine/metadata-modules/ai/ai-chat/utils/throw-agent-chat-thread-not-found.util';
import { type AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { PrivateRecordStorageService } from 'src/engine/permissions/private-record/services/private-record-storage.service';
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
    private readonly privateRecordStorageService: PrivateRecordStorageService,
  ) {}

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

    const { flatWorkspaceMemberMaps, flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatWorkspaceMemberMaps',
        'flatObjectMetadataMaps',
        'featureFlagsMap',
      ]);

    this.assertMembersAvailableOrThrow({ flatWorkspaceMemberMaps, pair });

    const threadObjectMetadata =
      findAgentChatFlatObjectMetadata(
        flatObjectMetadataMaps,
        'agentChatThread',
      ) ?? throwAgentChatThreadNotFound();

    const createdThreadId =
      await this.workspaceOrmManager.executeInWorkspaceContext(
        () =>
          this.workspaceOrmManager.runInWorkspaceTransaction(
            async (transactionScope) => {
              const { identifiers } = await transactionScope
                .getRepositoryWithoutPermissionChecks<AgentChatThreadWorkspaceEntity>(
                  'agentChatThread',
                  { shouldSkipEventEmission: true },
                )
                .insert(
                  {
                    conversationType: 'DIRECT_MESSAGE',
                    ...pair,
                    isAssistantParticipant: false,
                  },
                  { onConflictDoNothing: true },
                );

              await this.privateRecordStorageService.setPrivate({
                workspaceId,
                flatObjectMetadata: threadObjectMetadata,
                recordIds: identifiers.map(({ id }) => id),
                isPrivate: true,
                transactionScope,
              });

              return identifiers[0]?.id;
            },
          ),
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
