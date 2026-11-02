import { Injectable } from '@nestjs/common';

import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
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

    await this.assertStorageAvailableOrThrow(workspaceId);

    const existingThreadId = await this.findThreadId({ workspaceId, pair });

    if (isDefined(existingThreadId)) {
      return existingThreadId;
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
                .getRepository<AgentChatThreadWorkspaceEntity>(
                  'agentChatThread',
                  { shouldBypassPermissionChecks: true },
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

    return (
      createdThreadId ??
      (await this.findThreadId({ workspaceId, pair })) ??
      throwAgentChatThreadNotFound()
    );
  }

  // TODO(@bosiraphael): remove once 2.55 leaves the cross-upgrade window
  private async assertStorageAvailableOrThrow(
    workspaceId: string,
  ): Promise<void> {
    const { flatIndexMaps } = await this.workspaceCacheService.getOrRecompute(
      workspaceId,
      ['flatIndexMaps'],
    );

    if (
      !isDefined(
        flatIndexMaps.byUniversalIdentifier[
          STANDARD_OBJECTS.agentChatThread.indexes.directMessagePairUniqueIndex
            .universalIdentifier
        ],
      )
    ) {
      throw new AiException(
        'Direct messages are unavailable until this workspace finishes upgrading',
        AiExceptionCode.CHAT_UPGRADE_IN_PROGRESS,
      );
    }
  }

  private async findThreadId({
    workspaceId,
    pair,
  }: {
    workspaceId: string;
    pair: DirectMessagePair;
  }): Promise<string | undefined> {
    const thread = await this.threadRepository.findOne(workspaceId, {
      where: pair,
      select: ['id'],
    });

    return thread?.id;
  }

  private assertMembersAvailableOrThrow({
    flatWorkspaceMemberMaps,
    pair,
  }: {
    flatWorkspaceMemberMaps: FlatWorkspaceMemberMaps;
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
