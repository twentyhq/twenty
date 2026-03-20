import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import {
  MessageChannelSyncStage,
  MessageChannelType,
  MessageChannelVisibility,
} from 'twenty-shared/types';

import { MessageChannelDTO } from 'src/engine/metadata-modules/message-channel/dtos/message-channel.dto';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';

@Injectable()
export class MessageChannelMetadataService {
  constructor(
    @InjectRepository(MessageChannelEntity)
    private readonly repository: Repository<MessageChannelEntity>,
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

  async findById(
    id: string,
    workspaceId: string,
  ): Promise<MessageChannelDTO | null> {
    return this.repository.findOne({ where: { id, workspaceId } });
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
