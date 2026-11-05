import { Injectable } from '@nestjs/common';
import { isNonEmptyString } from '@sniptt/guards';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { type UserWorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { AgentChatThreadConversationType } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-chat-thread-conversation-type.enum';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';

const AGENT_CHAT_THREAD_CONTENT_OBJECT_NAMES = [
  'agentChatThread',
  'agentChatThreadParticipant',
  'agentChatThreadTarget',
  'agentTurn',
  'agentMessage',
  'agentMessagePart',
  'agentMessageReaction',
] as const;

@Injectable()
export class DirectMessageContentService {
  constructor(private readonly workspaceOrmManager: WorkspaceOrmManager) {}

  async isRecordDirectMessageContent({
    authContext,
    objectUniversalIdentifier,
    recordId,
    transactionScope,
  }: {
    authContext: UserWorkspaceAuthContext;
    objectUniversalIdentifier: string;
    recordId: string;
    transactionScope?: WorkspaceTransactionScope;
  }): Promise<boolean> {
    const agentChatThreadContentObjectName =
      AGENT_CHAT_THREAD_CONTENT_OBJECT_NAMES.find(
        (objectName) =>
          STANDARD_OBJECTS[objectName].universalIdentifier ===
          objectUniversalIdentifier,
      );

    if (!isDefined(agentChatThreadContentObjectName)) {
      return false;
    }

    return this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const transactionScopeOrWorkspaceOrmManager =
        transactionScope ?? this.workspaceOrmManager;
      const agentChatThreadId =
        await this.findAgentChatThreadIdContainingRecord({
          agentChatThreadContentObjectName,
          recordId,
          transactionScopeOrWorkspaceOrmManager,
        });

      if (!isDefined(agentChatThreadId)) {
        return true;
      }

      const agentChatThread = await transactionScopeOrWorkspaceOrmManager
        .getRepositoryWithoutPermissionChecks<AgentChatThreadWorkspaceEntity>(
          'agentChatThread',
        )
        .findOne({
          where: { id: agentChatThreadId },
          select: ['conversationType'],
          withDeleted: true,
        });

      return (
        !isDefined(agentChatThread) ||
        agentChatThread.conversationType ===
          AgentChatThreadConversationType.DIRECT_MESSAGE
      );
    }, authContext);
  }

  private async findAgentChatThreadIdContainingRecord({
    agentChatThreadContentObjectName,
    recordId,
    transactionScopeOrWorkspaceOrmManager,
  }: {
    agentChatThreadContentObjectName: (typeof AGENT_CHAT_THREAD_CONTENT_OBJECT_NAMES)[number];
    recordId: string;
    transactionScopeOrWorkspaceOrmManager:
      | WorkspaceTransactionScope
      | WorkspaceOrmManager;
  }): Promise<string | undefined> {
    if (agentChatThreadContentObjectName === 'agentChatThread') {
      return recordId;
    }

    const isAgentMessageChildObject =
      agentChatThreadContentObjectName === 'agentMessagePart' ||
      agentChatThreadContentObjectName === 'agentMessageReaction';
    const parentIdFieldName = isAgentMessageChildObject
      ? 'messageId'
      : 'threadId';
    const agentChatThreadContentRecord =
      await transactionScopeOrWorkspaceOrmManager
        .getRepositoryWithoutPermissionChecks(agentChatThreadContentObjectName)
        .findOne({
          where: { id: recordId },
          select: [parentIdFieldName],
          withDeleted: true,
        });
    const parentRecordId = agentChatThreadContentRecord?.[parentIdFieldName];

    if (!isNonEmptyString(parentRecordId)) {
      return undefined;
    }

    if (!isAgentMessageChildObject) {
      return parentRecordId;
    }

    const parentAgentMessage = await transactionScopeOrWorkspaceOrmManager
      .getRepositoryWithoutPermissionChecks('agentMessage')
      .findOne({
        where: { id: parentRecordId },
        select: ['threadId'],
        withDeleted: true,
      });

    return isNonEmptyString(parentAgentMessage?.threadId)
      ? parentAgentMessage.threadId
      : undefined;
  }
}
