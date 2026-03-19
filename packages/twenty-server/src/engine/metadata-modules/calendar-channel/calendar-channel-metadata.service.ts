import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';

@Injectable()
export class CalendarChannelMetadataService {
  constructor(
    @InjectRepository(CalendarChannelEntity)
    private readonly repository: Repository<CalendarChannelEntity>,
  ) {}

  async findAll(workspaceId: string): Promise<CalendarChannelEntity[]> {
    return this.repository.find({ where: { workspaceId } });
  }

  async findByConnectedAccountId(
    connectedAccountId: string,
    workspaceId: string,
  ): Promise<CalendarChannelEntity[]> {
    return this.repository.find({
      where: { connectedAccountId, workspaceId },
    });
  }

  async findById(
    id: string,
    workspaceId: string,
  ): Promise<CalendarChannelEntity | null> {
    return this.repository.findOne({ where: { id, workspaceId } });
  }

  async create(
    data: Partial<CalendarChannelEntity> & {
      workspaceId: string;
      handle: string;
      connectedAccountId: string;
      visibility: string;
      syncStage: string;
    },
  ): Promise<CalendarChannelEntity> {
    const entity = this.repository.create(data);

    return this.repository.save(entity);
  }

  async update(
    id: string,
    workspaceId: string,
    data: Partial<CalendarChannelEntity>,
  ): Promise<CalendarChannelEntity> {
    await this.repository.update(
      { id, workspaceId },
      data as Record<string, unknown>,
    );

    return this.repository.findOneOrFail({ where: { id, workspaceId } });
  }

  async delete(
    id: string,
    workspaceId: string,
  ): Promise<CalendarChannelEntity> {
    const entity = await this.repository.findOneOrFail({
      where: { id, workspaceId },
    });

    await this.repository.delete({ id, workspaceId });

    return entity;
  }
}
