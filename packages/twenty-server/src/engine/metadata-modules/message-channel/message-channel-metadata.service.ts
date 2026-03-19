import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';

@Injectable()
export class MessageChannelMetadataService {
  constructor(
    @InjectRepository(MessageChannelEntity)
    private readonly repository: Repository<MessageChannelEntity>,
  ) {}

  async findAll(workspaceId: string): Promise<MessageChannelEntity[]> {
    return this.repository.find({ where: { workspaceId } });
  }

  async findByConnectedAccountId(
    connectedAccountId: string,
    workspaceId: string,
  ): Promise<MessageChannelEntity[]> {
    return this.repository.find({
      where: { connectedAccountId, workspaceId },
    });
  }

  async findById(
    id: string,
    workspaceId: string,
  ): Promise<MessageChannelEntity | null> {
    return this.repository.findOne({ where: { id, workspaceId } });
  }

  async create(
    data: Partial<MessageChannelEntity> & {
      workspaceId: string;
      handle: string;
      connectedAccountId: string;
      visibility: string;
      type: string;
      syncStage: string;
    },
  ): Promise<MessageChannelEntity> {
    const entity = this.repository.create(data);

    return this.repository.save(entity);
  }

  async update(
    id: string,
    workspaceId: string,
    data: Partial<MessageChannelEntity>,
  ): Promise<MessageChannelEntity> {
    await this.repository.update(
      { id, workspaceId },
      data as Record<string, unknown>,
    );

    return this.repository.findOneOrFail({ where: { id, workspaceId } });
  }

  async delete(id: string, workspaceId: string): Promise<MessageChannelEntity> {
    const entity = await this.repository.findOneOrFail({
      where: { id, workspaceId },
    });

    await this.repository.delete({ id, workspaceId });

    return entity;
  }
}
