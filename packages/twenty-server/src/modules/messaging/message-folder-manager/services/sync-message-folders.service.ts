import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import {
  ConnectedAccountProvider,
  MessageFolderPendingSyncAction,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { In, Repository } from 'typeorm';

import {
  DiscoveredMessageFolder,
  MessageFolder,
} from 'src/modules/messaging/message-folder-manager/interfaces/message-folder-driver.interface';

import { type MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { MessageFolderEntity } from 'src/engine/metadata-modules/message-folder/entities/message-folder.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { GmailGetAllFoldersService } from 'src/modules/messaging/message-folder-manager/drivers/gmail/services/gmail-get-all-folders.service';
import { ImapGetAllFoldersService } from 'src/modules/messaging/message-folder-manager/drivers/imap/services/imap-get-all-folders.service';
import { MicrosoftGetAllFoldersService } from 'src/modules/messaging/message-folder-manager/drivers/microsoft/services/microsoft-get-all-folders.service';
import { computeFolderIdsToDelete } from 'src/modules/messaging/message-folder-manager/utils/compute-folder-ids-to-delete.util';
import { computeFoldersToCreate } from 'src/modules/messaging/message-folder-manager/utils/compute-folders-to-create.util';
import { computeFoldersToUpdate } from 'src/modules/messaging/message-folder-manager/utils/compute-folders-to-update.util';
import { computeUpdatedFolders } from 'src/modules/messaging/message-folder-manager/utils/compute-updated-folders.util';

@Injectable()
export class SyncMessageFoldersService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    @InjectRepository(MessageFolderEntity)
    private readonly messageFolderRepository: Repository<MessageFolderEntity>,
    private readonly gmailGetAllFoldersService: GmailGetAllFoldersService,
    private readonly microsoftGetAllFoldersService: MicrosoftGetAllFoldersService,
    private readonly imapGetAllFoldersService: ImapGetAllFoldersService,
  ) {}

  async syncMessageFolders({
    messageChannel,
    workspaceId,
  }: {
    messageChannel: Pick<
      MessageChannelEntity,
      'id' | 'messageFolderImportPolicy'
    > & {
      connectedAccount: Pick<
        ConnectedAccountEntity,
        | 'provider'
        | 'accessToken'
        | 'refreshToken'
        | 'id'
        | 'handle'
        | 'connectionParameters'
      >;
      messageFolders: MessageFolder[];
    };
    workspaceId: string;
  }): Promise<MessageFolder[]> {
    const discoveredFolders = await this.discoverAllFolders(
      messageChannel.connectedAccount,
      messageChannel,
    );

    const { messageFolders: existingFolders, id: messageChannelId } =
      messageChannel;

    return this.syncFolderChanges(
      discoveredFolders,
      existingFolders,
      messageChannelId,
      workspaceId,
    );
  }

  async discoverAllFolders(
    connectedAccount: Pick<
      ConnectedAccountEntity,
      | 'accessToken'
      | 'refreshToken'
      | 'id'
      | 'handle'
      | 'provider'
      | 'connectionParameters'
    >,
    messageChannel: Pick<MessageChannelEntity, 'messageFolderImportPolicy'>,
  ): Promise<DiscoveredMessageFolder[]> {
    switch (connectedAccount.provider) {
      case ConnectedAccountProvider.GOOGLE:
        return this.gmailGetAllFoldersService.getAllMessageFolders(
          connectedAccount,
          messageChannel,
        );
      case ConnectedAccountProvider.MICROSOFT:
        return this.microsoftGetAllFoldersService.getAllMessageFolders(
          connectedAccount,
          messageChannel,
        );
      case ConnectedAccountProvider.IMAP_SMTP_CALDAV:
        return this.imapGetAllFoldersService.getAllMessageFolders(
          connectedAccount,
          messageChannel,
        );
      default:
        throw new Error(
          `Provider ${connectedAccount.provider} is not supported`,
        );
    }
  }

  private async syncFolderChanges(
    discoveredFolders: DiscoveredMessageFolder[],
    existingFolders: MessageFolder[],
    messageChannelId: string,
    workspaceId: string,
  ): Promise<MessageFolder[]> {
    const foldersToCreate = computeFoldersToCreate({
      discoveredFolders,
      existingFolders,
      messageChannelId,
    });

    const foldersToUpdate = computeFoldersToUpdate({
      discoveredFolders,
      existingFolders,
    });

    const folderIdsToDelete = computeFolderIdsToDelete({
      discoveredFolders,
      existingFolders,
    });

    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        if (folderIdsToDelete.length > 0) {
          await this.messageFolderRepository.update(
            { id: In(folderIdsToDelete), workspaceId },
            {
              pendingSyncAction: MessageFolderPendingSyncAction.FOLDER_DELETION,
            },
          );
        }

        if (foldersToUpdate.size > 0) {
          for (const [id, data] of foldersToUpdate.entries()) {
            await this.messageFolderRepository.update(
              { id, messageChannelId, workspaceId },
              data as Record<string, unknown>,
            );
          }
        }

        if (foldersToCreate.length > 0) {
          for (const folderToCreate of foldersToCreate) {
            await this.messageFolderRepository.save({
              ...folderToCreate,
              workspaceId,
            });
          }
        }

        const createdFolders =
          foldersToCreate.length > 0
            ? await this.messageFolderRepository.find({
                where: {
                  messageChannelId,
                  externalId: In(
                    foldersToCreate
                      .map((folder) => folder.externalId)
                      .filter(isDefined),
                  ),
                  workspaceId,
                },
              })
            : [];

        const updatedExistingFolders = computeUpdatedFolders({
          existingFolders,
          foldersToUpdate,
          folderIdsToDelete,
        });

        return [...updatedExistingFolders, ...createdFolders];
      },
      authContext,
    );
  }
}
