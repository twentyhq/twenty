import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { In, Repository } from 'typeorm';

import {
  MessageChannelSyncStage,
  MessageChannelType,
  MessageChannelVisibility,
} from 'twenty-shared/types';

import { ConnectedAccountMetadataService } from 'src/engine/metadata-modules/connected-account/connected-account-metadata.service';
import { MessageChannelDTO } from 'src/engine/metadata-modules/message-channel/dtos/message-channel.dto';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import {
  MessageChannelException,
  MessageChannelExceptionCode,
} from 'src/engine/metadata-modules/message-channel/message-channel.exception';

@Injectable()
export class MessageChannelMetadataService {
  constructor(
    @InjectRepository(MessageChannelEntity)
    private readonly repository: Repository<MessageChannelEntity>,
    private readonly connectedAccountMetadataService: ConnectedAccountMetadataService,
  ) {}

  async findAll(workspaceId: string): Promise<MessageChannelDTO[]> {
    return this.repository.find({ where: { workspaceId } });
  }

  async findByConnectedAccountId(
    connectedAccountId: string,
    workspaceId: string,
  ): Promise<MessageChannelDTO[]> {
    return this.repository.find({
      where: { connectedAccountId, workspaceId },
    });
  }

  async findByConnectedAccountIds(
    connectedAccountIds: string[],
    workspaceId: string,
  ): Promise<MessageChannelDTO[]> {
    if (connectedAccountIds.length === 0) {
      return [];
    }

    return this.repository.find({
      where: { connectedAccountId: In(connectedAccountIds), workspaceId },
    });
  }

  async findById(
    id: string,
    workspaceId: string,
  ): Promise<MessageChannelDTO | null> {
    return this.repository.findOne({ where: { id, workspaceId } });
  }

  async verifyOwnership(
    id: string,
    userWorkspaceId: string,
    workspaceId: string,
  ): Promise<MessageChannelEntity> {
    const entity = await this.repository.findOne({
      where: { id, workspaceId },
    });

    if (!entity) {
      throw new MessageChannelException(
        `Message channel ${id} not found`,
        MessageChannelExceptionCode.MESSAGE_CHANNEL_NOT_FOUND,
      );
    }

    const userAccountIds =
      await this.connectedAccountMetadataService.getUserConnectedAccountIds(
        userWorkspaceId,
        workspaceId,
      );

    if (!userAccountIds.includes(entity.connectedAccountId)) {
      throw new MessageChannelException(
        `Message channel ${id} does not belong to user workspace ${userWorkspaceId}`,
        MessageChannelExceptionCode.MESSAGE_CHANNEL_OWNERSHIP_VIOLATION,
      );
    }

    return entity;
  }

  async create(
    data: Partial<MessageChannelEntity> & {
      workspaceId: string;
      handle: string;
      connectedAccountId: string;
      visibility: MessageChannelVisibility;
      type: MessageChannelType;
      syncStage: MessageChannelSyncStage;
    },
  ): Promise<MessageChannelDTO> {
    const entity = this.repository.create(data);

    return this.repository.save(entity);
  }

  async update(
    id: string,
    workspaceId: string,
    data: Partial<MessageChannelEntity>,
  ): Promise<MessageChannelDTO> {
    await this.repository.update(
      { id, workspaceId },
      data as Record<string, unknown>,
    );

    return this.repository.findOneOrFail({ where: { id, workspaceId } });
  }

  async delete(id: string, workspaceId: string): Promise<MessageChannelDTO> {
    const entity = await this.repository.findOneOrFail({
      where: { id, workspaceId },
    });

    await this.repository.delete({ id, workspaceId });

    return entity;
  }
}
