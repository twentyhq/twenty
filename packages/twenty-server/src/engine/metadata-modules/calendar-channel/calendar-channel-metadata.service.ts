import { Injectable } from '@nestjs/common';

import { In } from 'typeorm';

import {
  CalendarChannelException,
  CalendarChannelExceptionCode,
} from 'src/engine/metadata-modules/calendar-channel/calendar-channel.exception';
import { CALENDAR_CHANNEL_DELETED_EVENT } from 'src/engine/metadata-modules/calendar-channel/constants/calendar-channel-deleted.constant';
import { CalendarChannelDTO } from 'src/engine/metadata-modules/calendar-channel/dtos/calendar-channel.dto';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { type CalendarChannelDeletedEvent } from 'src/engine/metadata-modules/calendar-channel/types/calendar-channel-deleted.type';
import { ConnectedAccountMetadataService } from 'src/engine/metadata-modules/connected-account/connected-account-metadata.service';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

@Injectable()
export class CalendarChannelMetadataService {
  constructor(
    @InjectWorkspaceScopedRepository(CalendarChannelEntity)
    private readonly repository: WorkspaceScopedRepository<CalendarChannelEntity>,
    private readonly connectedAccountMetadataService: ConnectedAccountMetadataService,
    private readonly workspaceEventEmitter: WorkspaceEventEmitter,
  ) {}

  async findAll(workspaceId: string): Promise<CalendarChannelDTO[]> {
    return this.repository.find(workspaceId);
  }

  async findByUserWorkspaceId({
    userWorkspaceId,
    workspaceId,
  }: {
    userWorkspaceId: string;
    workspaceId: string;
  }): Promise<CalendarChannelDTO[]> {
    const userAccountIds =
      await this.connectedAccountMetadataService.getUserConnectedAccountIds({
        userWorkspaceId,
        workspaceId,
      });

    return this.findByConnectedAccountIds({
      connectedAccountIds: userAccountIds,
      workspaceId,
    });
  }

  async findByConnectedAccountIdForUser({
    connectedAccountId,
    userWorkspaceId,
    workspaceId,
  }: {
    connectedAccountId: string;
    userWorkspaceId: string;
    workspaceId: string;
  }): Promise<CalendarChannelDTO[]> {
    await this.connectedAccountMetadataService.verifyUsableByCaller({
      id: connectedAccountId,
      userWorkspaceId,
      workspaceId,
    });

    return this.findByConnectedAccountId({ connectedAccountId, workspaceId });
  }

  async findByConnectedAccountId({
    connectedAccountId,
    workspaceId,
  }: {
    connectedAccountId: string;
    workspaceId: string;
  }): Promise<CalendarChannelDTO[]> {
    return this.repository.find(workspaceId, {
      where: { connectedAccountId },
    });
  }

  async findByConnectedAccountIds({
    connectedAccountIds,
    workspaceId,
  }: {
    connectedAccountIds: string[];
    workspaceId: string;
  }): Promise<CalendarChannelDTO[]> {
    if (connectedAccountIds.length === 0) {
      return [];
    }

    return this.repository.find(workspaceId, {
      where: { connectedAccountId: In(connectedAccountIds) },
    });
  }

  async findById({
    id,
    workspaceId,
  }: {
    id: string;
    workspaceId: string;
  }): Promise<CalendarChannelDTO | null> {
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
  }): Promise<CalendarChannelEntity> {
    const calendarChannel = await this.repository.findOne(workspaceId, {
      where: { id },
    });

    if (!calendarChannel) {
      throw new CalendarChannelException(
        `Calendar channel ${id} not found`,
        CalendarChannelExceptionCode.CALENDAR_CHANNEL_NOT_FOUND,
      );
    }

    const userAccountIds =
      await this.connectedAccountMetadataService.getUserConnectedAccountIds({
        userWorkspaceId,
        workspaceId,
      });

    if (!userAccountIds.includes(calendarChannel.connectedAccountId)) {
      throw new CalendarChannelException(
        `Calendar channel ${id} does not belong to user workspace ${userWorkspaceId}`,
        CalendarChannelExceptionCode.CALENDAR_CHANNEL_OWNERSHIP_VIOLATION,
      );
    }

    return calendarChannel;
  }

  async update({
    id,
    workspaceId,
    data,
  }: {
    id: string;
    workspaceId: string;
    data: Partial<CalendarChannelEntity>;
  }): Promise<CalendarChannelDTO> {
    await this.repository.update(
      workspaceId,
      { id },
      data as Record<string, unknown>,
    );

    return this.repository.findOneOrFail(workspaceId, { where: { id } });
  }

  async delete({
    id,
    workspaceId,
  }: {
    id: string;
    workspaceId: string;
  }): Promise<CalendarChannelDTO> {
    const calendarChannel = await this.repository.findOneOrFail(workspaceId, {
      where: { id },
    });

    await this.repository.delete(workspaceId, { id });

    this.workspaceEventEmitter.emitCustomBatchEvent<CalendarChannelDeletedEvent>(
      CALENDAR_CHANNEL_DELETED_EVENT,
      [{ calendarChannelId: id }],
      workspaceId,
    );

    return calendarChannel;
  }
}
