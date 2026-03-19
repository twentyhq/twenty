import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { MessageFolderEntity } from 'src/engine/metadata-modules/message-folder/entities/message-folder.entity';

@Injectable()
export class MessageFolderMetadataService {
  constructor(
    @InjectRepository(MessageFolderEntity)
    private readonly repository: Repository<MessageFolderEntity>,
  ) {}

  async findAll(workspaceId: string): Promise<MessageFolderEntity[]> {
    return this.repository.find({ where: { workspaceId } });
  }

  async findByMessageChannelId(
    messageChannelId: string,
    workspaceId: string,
  ): Promise<MessageFolderEntity[]> {
    return this.repository.find({
      where: { messageChannelId, workspaceId },
    });
  }

  async findById(
    id: string,
    workspaceId: string,
  ): Promise<MessageFolderEntity | null> {
    return this.repository.findOne({ where: { id, workspaceId } });
  }

  async create(
    data: Partial<MessageFolderEntity> & {
      workspaceId: string;
      messageChannelId: string;
      pendingSyncAction: string;
    },
  ): Promise<MessageFolderEntity> {
    const entity = this.repository.create(data);

    return this.repository.save(entity);
  }

  async update(
    id: string,
    workspaceId: string,
    data: Partial<MessageFolderEntity>,
  ): Promise<MessageFolderEntity> {
    await this.repository.update(
      { id, workspaceId },
      data as Record<string, unknown>,
    );

    return this.repository.findOneOrFail({ where: { id, workspaceId } });
  }

  async delete(id: string, workspaceId: string): Promise<MessageFolderEntity> {
    const entity = await this.repository.findOneOrFail({
      where: { id, workspaceId },
    });

    await this.repository.delete({ id, workspaceId });

    return entity;
  }
}
