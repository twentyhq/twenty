import { Injectable } from '@nestjs/common';

import { MessageFolderPendingSyncAction } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { APP_INGESTION_LOCK_OPTIONS } from 'src/engine/metadata-modules/message-channel/constants/app-ingestion-lock-options.constant';
import { type AppMessageFolderInput } from 'src/engine/metadata-modules/message-channel/dtos/sync-app-message-folders.input';
import {
  MessageChannelException,
  MessageChannelExceptionCode,
} from 'src/engine/metadata-modules/message-channel/message-channel.exception';
import { ApplicationMessageChannelsService } from 'src/engine/metadata-modules/message-channel/services/application-message-channels.service';
import { buildAppIngestionLockKey } from 'src/engine/metadata-modules/message-channel/utils/build-app-ingestion-lock-key.util';
import { computeAppMessageFolderSyncPlan } from 'src/engine/metadata-modules/message-channel/utils/compute-app-message-folder-sync-plan.util';
import { type MessageFolderDTO } from 'src/engine/metadata-modules/message-folder/dtos/message-folder.dto';
import { MessageFolderEntity } from 'src/engine/metadata-modules/message-folder/entities/message-folder.entity';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { type MessageChannelMessageAssociationMessageFolderWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association-message-folder.workspace-entity';

type ApplicationScope = {
  applicationId: string;
  workspaceId: string;
  requestUserWorkspaceId: string | null;
};

type ChannelScope = ApplicationScope & {
  messageChannelId: string;
};

@Injectable()
export class ApplicationMessageFoldersService {
  constructor(
    private readonly applicationMessageChannelsService: ApplicationMessageChannelsService,
    @InjectWorkspaceScopedRepository(MessageFolderEntity)
    private readonly messageFolderRepository: WorkspaceScopedRepository<MessageFolderEntity>,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly cacheLockService: CacheLockService,
  ) {}

  async list({
    messageChannelId,
    ...applicationScope
  }: ApplicationScope & {
    messageChannelId?: string;
  }): Promise<MessageFolderDTO[]> {
    if (isDefined(messageChannelId)) {
      await this.findOwnedChannelOrThrow({
        ...applicationScope,
        messageChannelId,
      });

      return this.findFolders({
        workspaceId: applicationScope.workspaceId,
        messageChannelIds: [messageChannelId],
      });
    }

    const reachableChannels =
      await this.applicationMessageChannelsService.list(applicationScope);

    return this.findFolders({
      workspaceId: applicationScope.workspaceId,
      messageChannelIds: reachableChannels.map((channel) => channel.id),
    });
  }

  async sync({
    folders,
    ...scope
  }: ChannelScope & {
    folders: AppMessageFolderInput[];
  }): Promise<MessageFolderDTO[]> {
    await this.findOwnedChannelOrThrow(scope);

    this.assertExternalIdsAreUnique(folders);

    const { workspaceId, messageChannelId } = scope;

    await this.cacheLockService.withLock(
      () => this.applySync({ workspaceId, messageChannelId, folders }),
      buildAppIngestionLockKey({ workspaceId, messageChannelId }),
      APP_INGESTION_LOCK_OPTIONS,
    );

    return this.findFolders({
      workspaceId,
      messageChannelIds: [messageChannelId],
    });
  }

  private async applySync({
    workspaceId,
    messageChannelId,
    folders,
  }: {
    workspaceId: string;
    messageChannelId: string;
    folders: AppMessageFolderInput[];
  }): Promise<void> {
    const existingFolders = await this.messageFolderRepository.find(
      workspaceId,
      { where: { messageChannelId } },
    );

    const { foldersToCreate, foldersToUpdate, folderIdsToDelete } =
      computeAppMessageFolderSyncPlan({
        existingFolders,
        requestedFolders: folders,
      });

    if (foldersToCreate.length > 0) {
      await this.messageFolderRepository.insert(
        workspaceId,
        foldersToCreate.map((folder) => ({
          messageChannelId,
          externalId: folder.externalId,
          name: folder.name,
          isSynced: folder.isSynced,
          isSentFolder: false,
          parentFolderId: null,
          pendingSyncAction: MessageFolderPendingSyncAction.NONE,
        })),
      );
    }

    for (const { id, update } of foldersToUpdate) {
      await this.messageFolderRepository.update(workspaceId, { id }, update);
    }

    if (folderIdsToDelete.length > 0) {
      await this.deleteFolderMessageLinks({
        workspaceId,
        messageFolderIds: folderIdsToDelete,
      });

      await this.messageFolderRepository.delete(workspaceId, {
        id: In(folderIdsToDelete),
      });
    }
  }

  private async deleteFolderMessageLinks({
    workspaceId,
    messageFolderIds,
  }: {
    workspaceId: string;
    messageFolderIds: string[];
  }): Promise<void> {
    await this.workspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const messageFolderAssociationRepository =
          this.workspaceOrmManager.getRepository<MessageChannelMessageAssociationMessageFolderWorkspaceEntity>(
            'messageChannelMessageAssociationMessageFolder',
            { shouldBypassPermissionChecks: true },
          );

        await messageFolderAssociationRepository.delete({
          messageFolderId: In(messageFolderIds),
        });
      },
      buildSystemAuthContext(workspaceId),
      { lite: true },
    );
  }

  private async findOwnedChannelOrThrow({
    messageChannelId,
    ...applicationScope
  }: ChannelScope): Promise<void> {
    await this.applicationMessageChannelsService.findOwnedOrThrow({
      ...applicationScope,
      id: messageChannelId,
    });
  }

  private async findFolders({
    workspaceId,
    messageChannelIds,
  }: {
    workspaceId: string;
    messageChannelIds: string[];
  }): Promise<MessageFolderDTO[]> {
    if (!isNonEmptyArray(messageChannelIds)) {
      return [];
    }

    return this.messageFolderRepository.find(workspaceId, {
      where: { messageChannelId: In(messageChannelIds) },
      order: { name: 'ASC', id: 'ASC' },
    });
  }

  private assertExternalIdsAreUnique(folders: AppMessageFolderInput[]): void {
    const externalIds = new Set<string>();

    for (const folder of folders) {
      if (externalIds.has(folder.externalId)) {
        throw new MessageChannelException(
          `Folder externalId ${folder.externalId} appears more than once`,
          MessageChannelExceptionCode.INVALID_MESSAGE_CHANNEL_INPUT,
        );
      }

      externalIds.add(folder.externalId);
    }
  }
}
