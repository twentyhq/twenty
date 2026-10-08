import { Injectable, Logger } from '@nestjs/common';

import { type ImapFlow } from 'imapflow';
import { isDefined } from 'twenty-shared/utils';
import { In, MoreThan, Not } from 'typeorm';

import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type MessageChannelMessageAssociationMessageFolderWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association-message-folder.workspace-entity';
import { type MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';
import { getExpungedMessageUids } from 'src/modules/messaging/message-import-manager/drivers/imap/utils/get-expunged-message-uids.util';
import { parseMessageId } from 'src/modules/messaging/message-import-manager/drivers/imap/utils/parse-message-id.util';

const KNOWN_MESSAGES_PAGE_SIZE = 500;

type FindExpungedMessageExternalIdsArgs = {
  client: ImapFlow;
  workspaceId: string;
  messageChannelId: string;
  messageFolderId: string;
  messageExternalIdPrefix: string;
  highestSyncedUid: number;
  expectedServerMessageCount: number;
};

@Injectable()
export class ImapFindExpungedMessagesService {
  private readonly logger = new Logger(ImapFindExpungedMessagesService.name);

  constructor(private readonly workspaceOrmManager: WorkspaceOrmManager) {}

  async findExpungedMessageExternalIds({
    client,
    workspaceId,
    messageChannelId,
    messageFolderId,
    messageExternalIdPrefix,
    highestSyncedUid,
    expectedServerMessageCount,
  }: FindExpungedMessageExternalIdsArgs): Promise<string[] | null> {
    if (highestSyncedUid === 0) {
      return [];
    }

    const serverMessageUids = await client.search(
      { uid: `1:${highestSyncedUid}` },
      { uid: true },
    );

    if (
      !Array.isArray(serverMessageUids) ||
      serverMessageUids.length !== expectedServerMessageCount
    ) {
      this.logger.warn(
        `Folder ${messageExternalIdPrefix}: UID search returned ${Array.isArray(serverMessageUids) ? serverMessageUids.length : 'no result'} instead of ${expectedServerMessageCount} messages. Skipping expunged messages detection.`,
      );

      return null;
    }

    const knownMessageUids = await this.findKnownMessageUids({
      workspaceId,
      messageChannelId,
      messageFolderId,
      messageExternalIdPrefix,
      highestSyncedUid,
    });

    return getExpungedMessageUids({
      knownMessageUids,
      serverMessageUids,
    }).map((uid) => `${messageExternalIdPrefix}:${uid}`);
  }

  private async findKnownMessageUids({
    workspaceId,
    messageChannelId,
    messageFolderId,
    messageExternalIdPrefix,
    highestSyncedUid,
  }: Omit<
    FindExpungedMessageExternalIdsArgs,
    'client' | 'expectedServerMessageCount'
  >): Promise<number[]> {
    const authContext = buildSystemAuthContext(workspaceId);

    return this.workspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const messageFolderAssociationRepository =
          this.workspaceOrmManager.getRepository<MessageChannelMessageAssociationMessageFolderWorkspaceEntity>(
            'messageChannelMessageAssociationMessageFolder',
            { shouldBypassPermissionChecks: true },
          );

        const messageChannelMessageAssociationRepository =
          this.workspaceOrmManager.getRepository<MessageChannelMessageAssociationWorkspaceEntity>(
            'messageChannelMessageAssociation',
            { shouldBypassPermissionChecks: true },
          );

        const knownMessageUids: number[] = [];
        let lastMessageFolderAssociationId: string | undefined;

        for (;;) {
          const messageFolderAssociations =
            await messageFolderAssociationRepository.find({
              where: {
                messageFolderId,
                ...(isDefined(lastMessageFolderAssociationId) && {
                  id: MoreThan(lastMessageFolderAssociationId),
                }),
              },
              order: { id: 'ASC' },
              take: KNOWN_MESSAGES_PAGE_SIZE,
              select: { id: true, messageChannelMessageAssociationId: true },
            });

          if (messageFolderAssociations.length === 0) {
            break;
          }

          lastMessageFolderAssociationId =
            messageFolderAssociations[messageFolderAssociations.length - 1].id;

          const messageChannelMessageAssociationIds =
            messageFolderAssociations.map(
              ({ messageChannelMessageAssociationId }) =>
                messageChannelMessageAssociationId,
            );

          const messageChannelMessageAssociations =
            await messageChannelMessageAssociationRepository.find({
              where: {
                id: In(messageChannelMessageAssociationIds),
                messageChannelId,
              },
              select: { id: true, messageExternalId: true },
            });

          const associationsAlsoInOtherFolders =
            await messageFolderAssociationRepository.find({
              where: {
                messageChannelMessageAssociationId: In(
                  messageChannelMessageAssociationIds,
                ),
                messageFolderId: Not(messageFolderId),
              },
              select: { messageChannelMessageAssociationId: true },
            });

          const associationIdsAlsoInOtherFolders = new Set(
            associationsAlsoInOtherFolders.map(
              ({ messageChannelMessageAssociationId }) =>
                messageChannelMessageAssociationId,
            ),
          );

          for (const messageChannelMessageAssociation of messageChannelMessageAssociations) {
            if (
              associationIdsAlsoInOtherFolders.has(
                messageChannelMessageAssociation.id,
              ) ||
              !isDefined(messageChannelMessageAssociation.messageExternalId)
            ) {
              continue;
            }

            const parsedMessageId = parseMessageId(
              messageChannelMessageAssociation.messageExternalId,
            );

            if (
              parsedMessageId?.folder === messageExternalIdPrefix &&
              parsedMessageId.uid <= highestSyncedUid
            ) {
              knownMessageUids.push(parsedMessageId.uid);
            }
          }
        }

        return knownMessageUids;
      },
      authContext,
      { lite: true },
    );
  }
}
