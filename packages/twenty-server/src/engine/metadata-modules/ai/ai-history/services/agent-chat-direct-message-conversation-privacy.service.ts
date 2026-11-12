import { AgentChatThreadConversationType } from 'twenty-shared/ai';
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

import { normalizeAgentChatDirectMessagePairOrThrow } from 'src/engine/metadata-modules/ai/ai-chat/utils/normalize-agent-chat-direct-message-pair-or-throw.util';
import { throwAgentChatThreadNotFound } from 'src/engine/metadata-modules/ai/ai-chat/utils/throw-agent-chat-thread-not-found.util';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { type AgentHistoryObjectName } from 'src/engine/metadata-modules/ai/ai-history/types/agent-history-object-name.type';
import { AgentHistoryStorageException } from 'src/engine/metadata-modules/ai/ai-history/exceptions/agent-history-storage.exception';
import { RecordShareSystemWriteService } from 'src/engine/permissions/record-share/services/record-share-system-write.service';
import { PrivateRecordSystemWriteService } from 'src/engine/permissions/private-record/services/private-record-system-write.service';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

type DirectMessagePair = readonly [string, string];

@Injectable()
export class AgentChatDirectMessageConversationPrivacyService {
  constructor(
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly recordShareSystemWriteService: RecordShareSystemWriteService,
    private readonly privateRecordSystemWriteService: PrivateRecordSystemWriteService,
  ) {}

  async isDirectMessageIdentityEnabled(workspaceId: string): Promise<boolean> {
    const { featureFlagsMap } = await this.workspaceCacheService.getOrRecompute(
      workspaceId,
      ['featureFlagsMap'],
    );

    return featureFlagsMap[
      FeatureFlagKey.IS_AGENT_CHAT_DIRECT_MESSAGE_IDENTITY_ENABLED
    ];
  }

  async makeConversationRecordsPrivateToPair({
    workspaceId,
    transactionScope,
    pair,
    conversationObjectName,
    conversationRecordIds,
  }: {
    workspaceId: string;
    transactionScope: WorkspaceTransactionScope;
    pair: DirectMessagePair;
    conversationObjectName: AgentHistoryObjectName;
    conversationRecordIds: string[];
  }): Promise<void> {
    const conversationObjectMetadata =
      await this.getHistoryObjectMetadataOrThrow({
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

    await this.privateRecordSystemWriteService.setRecordsPrivacy({
      workspaceId,
      objectMetadataId: conversationObjectMetadata.id,
      recordIds: conversationRecordIds,
      isPrivate: true,
      transactionScope,
    });
    await this.recordShareSystemWriteService.insertRecordShares({
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
      await this.getHistoryObjectMetadataOrThrow({
        workspaceId,
        conversationObjectName,
      });

    await this.recordShareSystemWriteService.deleteRecordSharesByRecordIds({
      workspaceId,
      objectMetadataId: conversationObjectMetadata.id,
      recordIds: conversationRecordIds,
      transactionScope,
    });
  }

  async findDirectMessagePairOfThread({
    workspaceId,
    transactionScope,
    threadId,
  }: {
    workspaceId: string;
    transactionScope: WorkspaceTransactionScope;
    threadId: string;
  }): Promise<DirectMessagePair | null> {
    const isDirectMessageIdentityEnabled =
      await this.isDirectMessageIdentityEnabled(workspaceId);

    const thread = await transactionScope
      .getRepositoryWithoutPermissionChecks<AgentChatThreadWorkspaceEntity>(
        'agentChatThread',
      )
      .findOne({
        where: { id: threadId },
        withDeleted: true,
        select: isDirectMessageIdentityEnabled
          ? [
              'id',
              'conversationType',
              'directMessageFirstWorkspaceMemberId',
              'directMessageSecondWorkspaceMemberId',
            ]
          : ['id', 'conversationType'],
      });

    if (!isDefined(thread)) {
      return throwAgentChatThreadNotFound();
    }

    if (
      thread.conversationType !== AgentChatThreadConversationType.DIRECT_MESSAGE
    ) {
      return null;
    }

    const {
      directMessageFirstWorkspaceMemberId,
      directMessageSecondWorkspaceMemberId,
    } = thread;

    if (
      !isDirectMessageIdentityEnabled ||
      !isDefined(directMessageFirstWorkspaceMemberId) ||
      !isDefined(directMessageSecondWorkspaceMemberId)
    ) {
      return throwAgentChatThreadNotFound();
    }

    const pair = normalizeAgentChatDirectMessagePairOrThrow({
      firstWorkspaceMemberId: directMessageFirstWorkspaceMemberId,
      secondWorkspaceMemberId: directMessageSecondWorkspaceMemberId,
    });

    return [
      pair.directMessageFirstWorkspaceMemberId,
      pair.directMessageSecondWorkspaceMemberId,
    ];
  }

  private async getHistoryObjectMetadataOrThrow({
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
}
