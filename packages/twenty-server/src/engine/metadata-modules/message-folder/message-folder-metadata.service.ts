import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { In, Repository } from 'typeorm';

import {
  ConnectedAccountProvider,
  MessageFolderPendingSyncAction,
} from 'twenty-shared/types';

import { ConnectedAccountMetadataService } from 'src/engine/metadata-modules/connected-account/connected-account-metadata.service';
import { MessageFolderDTO } from 'src/engine/metadata-modules/message-folder/dtos/message-folder.dto';
import { MessageFolderEntity } from 'src/engine/metadata-modules/message-folder/entities/message-folder.entity';
import {
  MessageFolderException,
  MessageFolderExceptionCode,
} from 'src/engine/metadata-modules/message-folder/message-folder.exception';
import { MessageChannelMetadataService } from 'src/engine/metadata-modules/message-channel/message-channel-metadata.service';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { type QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

@Injectable()
export class MessageFolderMetadataService {
  constructor(
    // The manager is only reachable from the raw repository, and every
    // statement inside the transaction carries workspaceId itself.
    // eslint-disable-next-line twenty/prefer-workspace-scoped-repository
    @InjectRepository(MessageFolderEntity)
    private readonly unscopedRepository: Repository<MessageFolderEntity>,
    @InjectWorkspaceScopedRepository(MessageFolderEntity)
    private readonly repository: WorkspaceScopedRepository<MessageFolderEntity>,
    private readonly messageChannelMetadataService: MessageChannelMetadataService,
    private readonly connectedAccountMetadataService: ConnectedAccountMetadataService,
  ) {}

  async findAll(workspaceId: string): Promise<MessageFolderDTO[]> {
    return this.repository.find(workspaceId);
  }

  async findByUserWorkspaceId({
    userWorkspaceId,
    workspaceId,
  }: {
    userWorkspaceId: string;
    workspaceId: string;
  }): Promise<MessageFolderDTO[]> {
    const userAccountIds =
      await this.connectedAccountMetadataService.getUserConnectedAccountIds({
        userWorkspaceId,
        workspaceId,
      });

    const userChannels =
      await this.messageChannelMetadataService.findByConnectedAccountIds({
        connectedAccountIds: userAccountIds,
        workspaceId,
      });

    const userChannelIds = userChannels.map((channel) => channel.id);

    return this.findByMessageChannelIds({
      messageChannelIds: userChannelIds,
      workspaceId,
    });
  }

  async findByMessageChannelIdForUser({
    messageChannelId,
    userWorkspaceId,
    workspaceId,
  }: {
    messageChannelId: string;
    userWorkspaceId: string;
    workspaceId: string;
  }): Promise<MessageFolderDTO[]> {
    await this.messageChannelMetadataService.verifyUsableByCaller({
      id: messageChannelId,
      userWorkspaceId,
      workspaceId,
    });

    return this.findByMessageChannelId({ messageChannelId, workspaceId });
  }

  async findByMessageChannelId({
    messageChannelId,
    workspaceId,
  }: {
    messageChannelId: string;
    workspaceId: string;
  }): Promise<MessageFolderDTO[]> {
    return this.repository.find(workspaceId, {
      where: { messageChannelId },
    });
  }

  async findByMessageChannelIds({
    messageChannelIds,
    workspaceId,
  }: {
    messageChannelIds: string[];
    workspaceId: string;
  }): Promise<MessageFolderDTO[]> {
    if (messageChannelIds.length === 0) {
      return [];
    }

    return this.repository.find(workspaceId, {
      where: { messageChannelId: In(messageChannelIds) },
    });
  }

  async findById({
    id,
    workspaceId,
  }: {
    id: string;
    workspaceId: string;
  }): Promise<MessageFolderDTO | null> {
    return this.repository.findOne(workspaceId, { where: { id } });
  }

  async verifyOwnership({
    id,
    userWorkspaceId,
    workspaceId,
  }: {
    id: string;
    userWorkspaceId: string;
    workspaceId: string;
  }): Promise<MessageFolderEntity> {
    const messageFolder = await this.repository.findOne(workspaceId, {
      where: { id },
    });

    if (!messageFolder) {
      throw new MessageFolderException(
        `Message folder ${id} not found`,
        MessageFolderExceptionCode.MESSAGE_FOLDER_NOT_FOUND,
      );
    }

    const userAccountIds =
      await this.connectedAccountMetadataService.getUserConnectedAccountIds({
        userWorkspaceId,
        workspaceId,
      });

    const messageChannel = await this.messageChannelMetadataService.findById({
      id: messageFolder.messageChannelId,
      workspaceId,
    });

    if (
      !messageChannel ||
      !userAccountIds.includes(messageChannel.connectedAccountId)
    ) {
      throw new MessageFolderException(
        `Message folder ${id} does not belong to user workspace ${userWorkspaceId}`,
        MessageFolderExceptionCode.MESSAGE_FOLDER_OWNERSHIP_VIOLATION,
      );
    }

    return messageFolder;
  }

  async create(
    data: Partial<MessageFolderEntity> & {
      workspaceId: string;
      messageChannelId: string;
      pendingSyncAction: MessageFolderPendingSyncAction;
    },
  ): Promise<MessageFolderDTO> {
    return this.repository.insertAndReturnOne(
      data.workspaceId,
      data as QueryDeepPartialEntity<MessageFolderEntity>,
    );
  }

  async update({
    id,
    workspaceId,
    data,
  }: {
    id: string;
    workspaceId: string;
    data: Partial<MessageFolderEntity>;
  }): Promise<MessageFolderDTO> {
    await this.repository.update(
      workspaceId,
      { id },
      data as Record<string, unknown>,
    );

    return this.repository.findOneOrFail(workspaceId, { where: { id } });
  }

  async setSyncStatus({
    ids,
    workspaceId,
    data,
  }: {
    ids: string[];
    workspaceId: string;
    data: Partial<MessageFolderEntity>;
  }): Promise<MessageFolderDTO[]> {
    await this.unscopedRepository.manager.transaction(async (manager) => {
      if (!data.isSynced) {
        await manager.update(
          MessageFolderEntity,
          { id: In(ids), workspaceId },
          { isSynced: false },
        );
        await manager.update(
          MessageFolderEntity,
          {
            id: In(ids),
            workspaceId,
            pendingSyncAction: MessageFolderPendingSyncAction.FOLDER_IMPORT,
          },
          { pendingSyncAction: MessageFolderPendingSyncAction.NONE },
        );

        return;
      }

      const folderIdsToBackfill = (
        await manager.find(MessageFolderEntity, {
          where: {
            id: In(ids),
            workspaceId,
            isSynced: false,
            messageChannel: {
              connectedAccount: { provider: ConnectedAccountProvider.GOOGLE },
            },
          },
        })
      ).map((folder) => folder.id);

      await manager.update(
        MessageFolderEntity,
        { id: In(ids), workspaceId },
        { isSynced: true },
      );

      if (folderIdsToBackfill.length > 0) {
        await manager.update(
          MessageFolderEntity,
          { id: In(folderIdsToBackfill), workspaceId },
          { pendingSyncAction: MessageFolderPendingSyncAction.FOLDER_IMPORT },
        );
      }
    });

    return this.repository.find(workspaceId, { where: { id: In(ids) } });
  }

  async delete({
    id,
    workspaceId,
  }: {
    id: string;
    workspaceId: string;
  }): Promise<MessageFolderDTO> {
    const messageFolder = await this.repository.findOneOrFail(workspaceId, {
      where: { id },
    });

    await this.repository.delete(workspaceId, { id });

    return messageFolder;
  }
}
