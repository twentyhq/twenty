import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { In, Repository } from 'typeorm';

import {
  CalendarChannelSyncStage,
  CalendarChannelVisibility,
} from 'twenty-shared/types';

import {
  CalendarChannelException,
  CalendarChannelExceptionCode,
} from 'src/engine/metadata-modules/calendar-channel/calendar-channel.exception';
import { CalendarChannelDTO } from 'src/engine/metadata-modules/calendar-channel/dtos/calendar-channel.dto';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { ConnectedAccountMetadataService } from 'src/engine/metadata-modules/connected-account/connected-account-metadata.service';

@Injectable()
export class CalendarChannelMetadataService {
  constructor(
    @InjectRepository(CalendarChannelEntity)
    private readonly repository: Repository<CalendarChannelEntity>,
    private readonly connectedAccountMetadataService: ConnectedAccountMetadataService,
  ) {}

  async findAll(workspaceId: string): Promise<CalendarChannelDTO[]> {
    return this.repository.find({ where: { workspaceId } });
  }

  async findByConnectedAccountId(
    connectedAccountId: string,
    workspaceId: string,
  ): Promise<CalendarChannelDTO[]> {
    return this.repository.find({
      where: { connectedAccountId, workspaceId },
    });
  }

  async findByConnectedAccountIds(
    connectedAccountIds: string[],
    workspaceId: string,
  ): Promise<CalendarChannelDTO[]> {
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
  ): Promise<CalendarChannelDTO | null> {
    return this.repository.findOne({ where: { id, workspaceId } });
  }

  async verifyOwnership(
    id: string,
    userWorkspaceId: string,
    workspaceId: string,
  ): Promise<CalendarChannelEntity> {
    const entity = await this.repository.findOne({
      where: { id, workspaceId },
    });

    if (!entity) {
      throw new CalendarChannelException(
        `Calendar channel ${id} not found`,
        CalendarChannelExceptionCode.CALENDAR_CHANNEL_NOT_FOUND,
      );
    }

    const userAccountIds =
      await this.connectedAccountMetadataService.getUserConnectedAccountIds(
        userWorkspaceId,
        workspaceId,
      );

    if (!userAccountIds.includes(entity.connectedAccountId)) {
      throw new CalendarChannelException(
        `Calendar channel ${id} does not belong to user workspace ${userWorkspaceId}`,
        CalendarChannelExceptionCode.CALENDAR_CHANNEL_OWNERSHIP_VIOLATION,
      );
    }

    return entity;
  }

  async create(
    data: Partial<CalendarChannelEntity> & {
      workspaceId: string;
      handle: string;
      connectedAccountId: string;
      visibility: CalendarChannelVisibility;
      syncStage: CalendarChannelSyncStage;
    },
  ): Promise<CalendarChannelDTO> {
    const entity = this.repository.create(data);

    return this.repository.save(entity);
  }

  async update(
    id: string,
    workspaceId: string,
    data: Partial<CalendarChannelEntity>,
  ): Promise<CalendarChannelDTO> {
    await this.repository.update(
      { id, workspaceId },
      data as Record<string, unknown>,
    );

    return this.repository.findOneOrFail({ where: { id, workspaceId } });
  }

  async delete(id: string, workspaceId: string): Promise<CalendarChannelDTO> {
    const entity = await this.repository.findOneOrFail({
      where: { id, workspaceId },
    });

    await this.repository.delete({ id, workspaceId });

    return entity;
  }
}
