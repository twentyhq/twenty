import { Injectable } from '@nestjs/common';
import { isNonEmptyString } from '@sniptt/guards';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { type UserWorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';

const DIRECT_MESSAGE_CONTENT_OBJECT_NAMES = [
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

  async isDirectMessageContent({
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
    const objectName = DIRECT_MESSAGE_CONTENT_OBJECT_NAMES.find(
      (name) =>
        STANDARD_OBJECTS[name].universalIdentifier ===
        objectUniversalIdentifier,
    );

    if (!isDefined(objectName)) {
      return false;
    }

    return this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const repositorySource = transactionScope ?? this.workspaceOrmManager;
      const threadId = await this.findThreadId({
        objectName,
        recordId,
        repositorySource,
      });

      if (!isDefined(threadId)) {
        return true;
      }

      const thread = await repositorySource
        .getRepositoryWithoutPermissionChecks<AgentChatThreadWorkspaceEntity>(
          'agentChatThread',
        )
        .findOne({
          where: { id: threadId },
          select: ['conversationType'],
          withDeleted: true,
        });

      return !isDefined(thread) || thread.conversationType === 'DIRECT_MESSAGE';
    }, authContext);
  }

  private async findThreadId({
    objectName,
    recordId,
    repositorySource,
  }: {
    objectName: (typeof DIRECT_MESSAGE_CONTENT_OBJECT_NAMES)[number];
    recordId: string;
    repositorySource: WorkspaceTransactionScope | WorkspaceOrmManager;
  }): Promise<string | undefined> {
    if (objectName === 'agentChatThread') {
      return recordId;
    }

    const isMessageChild =
      objectName === 'agentMessagePart' ||
      objectName === 'agentMessageReaction';
    const parentIdField = isMessageChild ? 'messageId' : 'threadId';
    const record = await repositorySource
      .getRepositoryWithoutPermissionChecks(objectName)
      .findOne({
        where: { id: recordId },
        select: [parentIdField],
        withDeleted: true,
      });
    const parentId = record?.[parentIdField];

    if (!isNonEmptyString(parentId)) {
      return undefined;
    }

    if (!isMessageChild) {
      return parentId;
    }

    const message = await repositorySource
      .getRepositoryWithoutPermissionChecks('agentMessage')
      .findOne({
        where: { id: parentId },
        select: ['threadId'],
        withDeleted: true,
      });

    return isNonEmptyString(message?.threadId) ? message.threadId : undefined;
  }
}
