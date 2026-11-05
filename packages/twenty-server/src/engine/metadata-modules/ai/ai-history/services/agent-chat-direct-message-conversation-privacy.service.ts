import { doNotTranslate } from 'twenty-shared/i18n';
import { Injectable } from '@nestjs/common';

import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  FeatureFlagKey,
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  RecordShareRowCause,
} from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { throwAgentChatThreadNotFound } from 'src/engine/metadata-modules/ai/ai-chat/utils/throw-agent-chat-thread-not-found.util';
import { AgentChatThreadConversationType } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-chat-thread-conversation-type.enum';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { type AgentHistoryObjectName } from 'src/engine/metadata-modules/ai/ai-history/types/agent-history-object-name.type';
import { AgentHistoryStorageException } from 'src/engine/metadata-modules/ai/ai-history/exceptions/agent-history-storage.exception';
import { PrivateRecordStorageService } from 'src/engine/permissions/private-record/services/private-record-storage.service';
import { RecordShareStorageService } from 'src/engine/permissions/record-share/services/record-share-storage.service';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

type DirectMessagePair = readonly [string, string];

@Injectable()
export class AgentChatDirectMessageConversationPrivacyService {
  constructor(
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly privateRecordStorageService: PrivateRecordStorageService,
    private readonly recordShareStorageService: RecordShareStorageService,
  ) {}

  async isDirectMessageIdentityEnabled(workspaceId: string): Promise<boolean> {
    const { featureFlagsMap } = await this.workspaceCacheService.getOrRecompute(
      workspaceId,
      ['featureFlagsMap'],
    );

    return !!featureFlagsMap[
      FeatureFlagKey.IS_AGENT_CHAT_DIRECT_MESSAGE_IDENTITY_ENABLED
    ];
  }

  async makeConversationRecordsPrivateToPair({
    workspaceId,
    transactionScope,
    threadId,
    conversationObjectName,
    conversationRecordIds,
    directMessagePairsByThreadId,
  }: {
    workspaceId: string;
    transactionScope: WorkspaceTransactionScope;
    threadId: string;
    conversationObjectName: AgentHistoryObjectName;
    conversationRecordIds: string[];
    directMessagePairsByThreadId?: Map<string, DirectMessagePair | null>;
  }): Promise<boolean> {
    const pair = await this.findDirectMessagePairOfThread({
      transactionScope,
      threadId,
      directMessagePairsByThreadId,
    });

    if (!isDefined(pair)) {
      return false;
    }

    const conversationObjectMetadata =
      await this.findConversationObjectMetadataOrThrow({
        workspaceId,
        conversationObjectName,
      });
    const { flatWorkspaceMemberMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatWorkspaceMemberMaps',
      ]);

    const activePairWorkspaceMemberIds = pair.filter((workspaceMemberId) => {
      const member = flatWorkspaceMemberMaps.byId[workspaceMemberId];

      return isDefined(member) && !isDefined(member.deletedAt);
    });

    await this.privateRecordStorageService.setPrivate({
      workspaceId,
      flatObjectMetadata: conversationObjectMetadata,
      recordIds: conversationRecordIds,
      isPrivate: true,
      transactionScope,
    });
    await this.recordShareStorageService.insertMany({
      workspaceId,
      transactionScope,
      recordShares: conversationRecordIds.flatMap((conversationRecordId) =>
        activePairWorkspaceMemberIds.map((principalId) => ({
          objectMetadataId: conversationObjectMetadata.id,
          recordId: conversationRecordId,
          principalId,
          principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
          accessLevel: RecordShareAccessLevel.READ_WRITE,
          rowCause: RecordShareRowCause.OWNER,
          sourceId: conversationRecordId,
        })),
      ),
    });

    return true;
  }

  async deletePairSharesOfConversationRecords({
    workspaceId,
    transactionScope,
    conversationObjectName,
    conversationRecordIds,
  }: {
    workspaceId: string;
    transactionScope: WorkspaceTransactionScope;
    conversationObjectName: AgentHistoryObjectName;
    conversationRecordIds: string[];
  }): Promise<void> {
    if (!isNonEmptyArray(conversationRecordIds)) {
      return;
    }

    const conversationObjectMetadata =
      await this.findConversationObjectMetadataOrThrow({
        workspaceId,
        conversationObjectName,
      });

    await this.recordShareStorageService.deleteByRecordIds({
      workspaceId,
      objectMetadataId: conversationObjectMetadata.id,
      recordIds: conversationRecordIds,
      transactionScope,
    });
  }

  private async findConversationObjectMetadataOrThrow({
    workspaceId,
    conversationObjectName,
  }: {
    workspaceId: string;
    conversationObjectName: AgentHistoryObjectName;
  }) {
    const { flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
      ]);
    const conversationObjectMetadata =
      flatObjectMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS[conversationObjectName].universalIdentifier
      ];

    if (!isDefined(conversationObjectMetadata)) {
      throw new AgentHistoryStorageException({
        code: 'OBJECT_METADATA_NOT_FOUND',
        message: doNotTranslate(
          `Object metadata for ${conversationObjectName} was not found`,
        ),
      });
    }

    return conversationObjectMetadata;
  }

  private async findDirectMessagePairOfThread({
    transactionScope,
    threadId,
    directMessagePairsByThreadId,
  }: {
    transactionScope: WorkspaceTransactionScope;
    threadId: string;
    directMessagePairsByThreadId?: Map<string, DirectMessagePair | null>;
  }): Promise<DirectMessagePair | null> {
    if (
      isDefined(directMessagePairsByThreadId) &&
      directMessagePairsByThreadId.has(threadId)
    ) {
      return directMessagePairsByThreadId.get(threadId) ?? null;
    }

    const thread = await transactionScope
      .getRepositoryWithoutPermissionChecks<AgentChatThreadWorkspaceEntity>(
        'agentChatThread',
      )
      .findOne({
        where: { id: threadId },
        withDeleted: true,
        select: [
          'id',
          'conversationType',
          'directMessageFirstWorkspaceMemberId',
          'directMessageSecondWorkspaceMemberId',
        ],
      });

    if (!isDefined(thread)) {
      return throwAgentChatThreadNotFound();
    }

    if (
      thread.conversationType !== AgentChatThreadConversationType.DIRECT_MESSAGE
    ) {
      directMessagePairsByThreadId?.set(threadId, null);

      return null;
    }

    const {
      directMessageFirstWorkspaceMemberId,
      directMessageSecondWorkspaceMemberId,
    } = thread;

    if (
      !isDefined(directMessageFirstWorkspaceMemberId) ||
      !isDefined(directMessageSecondWorkspaceMemberId)
    ) {
      return throwAgentChatThreadNotFound();
    }

    const pair: DirectMessagePair = [
      directMessageFirstWorkspaceMemberId,
      directMessageSecondWorkspaceMemberId,
    ];

    directMessagePairsByThreadId?.set(threadId, pair);

    return pair;
  }
}
