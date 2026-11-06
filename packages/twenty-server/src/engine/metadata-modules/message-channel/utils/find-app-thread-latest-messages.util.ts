import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { type MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';
import { type MessageWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message.workspace-entity';

const APP_THREAD_LOOKUP_MESSAGE_LIMIT = 50;

export type AppThreadLatestMessages = {
  threadExternalId: string;
  latestMessageIds: string[];
};

// Must run inside a workspace context.
export const findAppThreadLatestMessages = async ({
  workspaceOrmManager,
  messageChannelId,
  messageThreadId,
}: {
  workspaceOrmManager: WorkspaceOrmManager;
  messageChannelId: string;
  messageThreadId: string;
}): Promise<AppThreadLatestMessages | null> => {
  const messageRepository =
    workspaceOrmManager.getRepositoryWithoutPermissionChecks<MessageWorkspaceEntity>(
      'message',
    );

  const threadMessages = await messageRepository.find({
    where: { messageThreadId },
    select: { id: true },
  });

  const threadMessageIds = threadMessages.map((message) => message.id);

  if (!isNonEmptyArray(threadMessageIds)) {
    return null;
  }

  const associations = await workspaceOrmManager
    .getRepositoryWithoutPermissionChecks<MessageChannelMessageAssociationWorkspaceEntity>(
      'messageChannelMessageAssociation',
    )
    .find({
      where: { messageChannelId, messageId: In(threadMessageIds) },
      select: { messageId: true, messageThreadExternalId: true },
    });

  if (!isNonEmptyArray(associations)) {
    return null;
  }

  const latestMessages = await messageRepository.find({
    where: { id: In(associations.map((association) => association.messageId)) },
    select: { id: true },
    order: { receivedAt: 'DESC' },
    take: APP_THREAD_LOOKUP_MESSAGE_LIMIT,
  });

  const latestMessageIds = latestMessages.map((message) => message.id);

  const threadExternalId = latestMessageIds
    .flatMap((messageId) =>
      associations.filter((association) => association.messageId === messageId),
    )
    .find((association) =>
      isDefined(association.messageThreadExternalId),
    )?.messageThreadExternalId;

  if (!isDefined(threadExternalId)) {
    return null;
  }

  return { threadExternalId, latestMessageIds };
};
