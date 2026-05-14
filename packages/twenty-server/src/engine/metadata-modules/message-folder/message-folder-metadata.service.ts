import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { In, Repository } from 'typeorm';

import {
  ConnectedAccountProvider,
  MessageChannelSyncStage,
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
    const googleMessageChannelIdsToReset =
      await this.findGoogleMessageChannelIdsForEnabledFolders({
        ids: [id],
        workspaceId,
        data,
      });

    await this.repository.update(
      { id, workspaceId },
      data as Record<string, unknown>,
    );

    await this.resetGoogleMessageChannelCursor(googleMessageChannelIdsToReset, {
      workspaceId,
    });

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
    const googleMessageChannelIdsToReset =
      await this.findGoogleMessageChannelIdsForEnabledFolders({
        ids,
        workspaceId,
        data,
      });

    await this.repository.update(
      { id: In(ids), workspaceId },
      data as Record<string, unknown>,
    );

    await this.resetGoogleMessageChannelCursor(googleMessageChannelIdsToReset, {
      workspaceId,
    });

    return this.repository.find({ where: { id: In(ids), workspaceId } });
  }

  private async findGoogleMessageChannelIdsForEnabledFolders({
    ids,
    workspaceId,
    data,
  }: {
    ids: string[];
    workspaceId: string;
    data: Partial<MessageFolderEntity>;
  }): Promise<string[]> {
    if (data.isSynced !== true || ids.length === 0) {
      return [];
    }

    const newlyEnabledFolders = await this.repository.find({
      where: { id: In(ids), workspaceId, isSynced: false },
      select: ['id', 'messageChannelId'],
    });

    const messageChannelIds = [
      ...new Set(newlyEnabledFolders.map((folder) => folder.messageChannelId)),
    ];

    const googleMessageChannelIds = await Promise.all(
      messageChannelIds.map(async (messageChannelId) => {
        const messageChannel =
          await this.messageChannelMetadataService.findById({
            id: messageChannelId,
            workspaceId,
          });

        if (!messageChannel) {
          return null;
        }

        const connectedAccount =
          await this.connectedAccountMetadataService.findById({
            id: messageChannel.connectedAccountId,
            workspaceId,
          });

        return connectedAccount?.provider === ConnectedAccountProvider.GOOGLE
          ? messageChannel.id
          : null;
      }),
    );

    return googleMessageChannelIds.filter((id) => id !== null);
  }

  private async resetGoogleMessageChannelCursor(
    messageChannelIds: string[],
    { workspaceId }: { workspaceId: string },
  ): Promise<void> {
    await Promise.all(
      messageChannelIds.map((messageChannelId) =>
        this.messageChannelMetadataService.update({
          id: messageChannelId,
          workspaceId,
          data: {
            syncCursor: '',
            syncStage: MessageChannelSyncStage.MESSAGE_LIST_FETCH_PENDING,
            syncStageStartedAt: null,
          },
        }),
      ),
    );
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
