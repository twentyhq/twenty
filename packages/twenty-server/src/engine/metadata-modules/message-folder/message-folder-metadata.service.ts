import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { In, Repository } from 'typeorm';

import { MessageFolderPendingSyncAction } from 'twenty-shared/types';

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

  async findByMessageChannelId(
    messageChannelId: string,
    workspaceId: string,
  ): Promise<MessageFolderDTO[]> {
    return this.repository.find({
      where: { messageChannelId, workspaceId },
    });
  }

  async findByMessageChannelIds(
    messageChannelIds: string[],
    workspaceId: string,
  ): Promise<MessageFolderDTO[]> {
    if (messageChannelIds.length === 0) {
      return [];
    }

    return this.repository.find({
      where: { messageChannelId: In(messageChannelIds), workspaceId },
    });
  }

  async findById(
    id: string,
    workspaceId: string,
  ): Promise<MessageFolderDTO | null> {
    return this.repository.findOne({ where: { id, workspaceId } });
  }

  async verifyOwnership(
    id: string,
    userWorkspaceId: string,
    workspaceId: string,
  ): Promise<MessageFolderEntity> {
    const entity = await this.repository.findOne({
      where: { id, workspaceId },
    });

    if (!entity) {
      throw new MessageFolderException(
        `Message folder ${id} not found`,
        MessageFolderExceptionCode.MESSAGE_FOLDER_NOT_FOUND,
      );
    }

    const userAccountIds =
      await this.connectedAccountMetadataService.getUserConnectedAccountIds(
        userWorkspaceId,
        workspaceId,
      );

    const messageChannel = await this.messageChannelMetadataService.findById(
      entity.messageChannelId,
      workspaceId,
    );

    if (
      !messageChannel ||
      !userAccountIds.includes(messageChannel.connectedAccountId)
    ) {
      throw new MessageFolderException(
        `Message folder ${id} does not belong to user workspace ${userWorkspaceId}`,
        MessageFolderExceptionCode.MESSAGE_FOLDER_OWNERSHIP_VIOLATION,
      );
    }

    return entity;
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

  async update(
    id: string,
    workspaceId: string,
    data: Partial<MessageFolderEntity>,
  ): Promise<MessageFolderDTO> {
    await this.repository.update(
      { id, workspaceId },
      data as Record<string, unknown>,
    );

    return this.repository.findOneOrFail({ where: { id, workspaceId } });
  }

  async delete(id: string, workspaceId: string): Promise<MessageFolderDTO> {
    const entity = await this.repository.findOneOrFail({
      where: { id, workspaceId },
    });

    await this.repository.delete({ id, workspaceId });

    return entity;
  }
}
