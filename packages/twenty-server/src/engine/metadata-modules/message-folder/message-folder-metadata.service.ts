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

@Injectable()
export class MessageFolderMetadataService {
  constructor(
    @InjectRepository(MessageFolderEntity)
    private readonly repository: Repository<MessageFolderEntity>,
    private readonly messageChannelMetadataService: MessageChannelMetadataService,
    private readonly connectedAccountMetadataService: ConnectedAccountMetadataService,
  ) {}

  async findAll(workspaceId: string): Promise<MessageFolderDTO[]> {
    return this.repository.find({ where: { workspaceId } });
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
    await this.messageChannelMetadataService.verifyOwnership({
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
    return this.repository.find({
      where: { messageChannelId, workspaceId },
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

    return this.repository.find({
      where: { messageChannelId: In(messageChannelIds), workspaceId },
    });
  }

  async findById({
    id,
    workspaceId,
  }: {
    id: string;
    workspaceId: string;
  }): Promise<MessageFolderDTO | null> {
    return this.repository.findOne({ where: { id, workspaceId } });
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
    const messageFolder = await this.repository.findOne({
      where: { id, workspaceId },
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
    const entity = this.repository.create(data);

    return this.repository.save(entity);
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
      { id, workspaceId },
      data as Record<string, unknown>,
    );

    return this.repository.findOneOrFail({ where: { id, workspaceId } });
  }

  async updateMany({
    ids,
    workspaceId,
    data,
  }: {
    ids: string[];
    workspaceId: string;
    data: Partial<MessageFolderEntity>;
  }): Promise<MessageFolderDTO[]> {
    await this.repository.manager.transaction(async (transactionManager) => {
      const foldersToImport =
        data.isSynced === true
          ? await transactionManager.find(MessageFolderEntity, {
              where: { id: In(ids), workspaceId, isSynced: false },
              relations: { messageChannel: { connectedAccount: true } },
            })
          : [];

      await transactionManager.update(
        MessageFolderEntity,
        { id: In(ids), workspaceId },
        data as Record<string, unknown>,
      );

      const folderIdsToImport = foldersToImport
        .filter(
          (folder) =>
            folder.messageChannel?.connectedAccount?.provider ===
            ConnectedAccountProvider.GOOGLE,
        )
        .map((folder) => folder.id);

      if (folderIdsToImport.length > 0) {
        await transactionManager.update(
          MessageFolderEntity,
          { id: In(folderIdsToImport), workspaceId },
          { pendingSyncAction: MessageFolderPendingSyncAction.FOLDER_IMPORT },
        );
      }

      if (data.isSynced === false) {
        await transactionManager.update(
          MessageFolderEntity,
          {
            id: In(ids),
            workspaceId,
            pendingSyncAction: MessageFolderPendingSyncAction.FOLDER_IMPORT,
          },
          { pendingSyncAction: MessageFolderPendingSyncAction.NONE },
        );
      }
    });

    return this.repository.find({ where: { id: In(ids), workspaceId } });
  }

  async delete({
    id,
    workspaceId,
  }: {
    id: string;
    workspaceId: string;
  }): Promise<MessageFolderDTO> {
    const messageFolder = await this.repository.findOneOrFail({
      where: { id, workspaceId },
    });

    await this.repository.delete({ id, workspaceId });

    return messageFolder;
  }
}
