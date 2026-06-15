import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { In, Repository } from 'typeorm';

import {
  CalendarChannelSyncStage,
  CalendarChannelVisibility,
} from 'twenty-shared/types';

import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import {
  CalendarChannelException,
  CalendarChannelExceptionCode,
} from 'src/engine/metadata-modules/calendar-channel/calendar-channel.exception';
import { CALENDAR_CHANNEL_DELETED_EVENT } from 'src/engine/metadata-modules/calendar-channel/constants/calendar-channel-deleted.constant';
import { CalendarChannelDTO } from 'src/engine/metadata-modules/calendar-channel/dtos/calendar-channel.dto';
import { CalendarChannelOwnerDTO } from 'src/engine/metadata-modules/calendar-channel/dtos/calendar-channel-owner.dto';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { type CalendarChannelDeletedEvent } from 'src/engine/metadata-modules/calendar-channel/types/calendar-channel-deleted.type';
import { ConnectedAccountMetadataService } from 'src/engine/metadata-modules/connected-account/connected-account-metadata.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Injectable()
export class CalendarChannelMetadataService {
  constructor(
    @InjectRepository(CalendarChannelEntity)
    private readonly repository: Repository<CalendarChannelEntity>,
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
    private readonly connectedAccountMetadataService: ConnectedAccountMetadataService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly workspaceEventEmitter: WorkspaceEventEmitter,
  ) {}

  async findAll(workspaceId: string): Promise<CalendarChannelDTO[]> {
    return this.repository.find({ where: { workspaceId } });
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
    await this.connectedAccountMetadataService.verifyOwnership({
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
    return this.repository.find({
      where: { connectedAccountId, workspaceId },
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

    return this.repository.find({
      where: { connectedAccountId: In(connectedAccountIds), workspaceId },
    });
  }

  async findById({
    id,
    workspaceId,
  }: {
    id: string;
    workspaceId: string;
  }): Promise<CalendarChannelDTO | null> {
    return this.repository.findOne({ where: { id, workspaceId } });
  }

  async findChannelOwners({
    workspaceId,
    calendarChannelIds,
  }: {
    workspaceId: string;
    calendarChannelIds?: string[];
  }): Promise<CalendarChannelOwnerDTO[]> {
    if (calendarChannelIds?.length === 0) {
      return [];
    }

    const calendarChannels = await this.repository.find({
      where: {
        workspaceId,
        ...(isDefined(calendarChannelIds)
          ? { id: In(calendarChannelIds) }
          : {}),
      },
      relations: { connectedAccount: true },
    });

    if (calendarChannels.length === 0) {
      return [];
    }

    const userWorkspaceIds = [
      ...new Set(
        calendarChannels.map(
          (calendarChannel) => calendarChannel.connectedAccount.userWorkspaceId,
        ),
      ),
    ];
    const userWorkspaces = await this.userWorkspaceRepository.find({
      where: { id: In(userWorkspaceIds), workspaceId },
    });
    const userIdByUserWorkspaceId = new Map(
      userWorkspaces.map((userWorkspace) => [
        userWorkspace.id,
        userWorkspace.userId,
      ]),
    );
    const workspaceMemberIdByUserId =
      await this.findWorkspaceMemberIdsByUserIds({
        workspaceId,
        userIds: [...new Set(userIdByUserWorkspaceId.values())],
      });

    return calendarChannels.map((calendarChannel) => {
      const userId = userIdByUserWorkspaceId.get(
        calendarChannel.connectedAccount.userWorkspaceId,
      );

      return {
        calendarChannelId: calendarChannel.id,
        workspaceMemberId: isDefined(userId)
          ? (workspaceMemberIdByUserId.get(userId) ?? null)
          : null,
      };
    });
  }

  private async findWorkspaceMemberIdsByUserIds({
    workspaceId,
    userIds,
  }: {
    workspaceId: string;
    userIds: string[];
  }): Promise<Map<string, string>> {
    if (userIds.length === 0) {
      return new Map();
    }

    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const workspaceMemberRepository =
          await this.globalWorkspaceOrmManager.getRepository<WorkspaceMemberWorkspaceEntity>(
            workspaceId,
            'workspaceMember',
            { shouldBypassPermissionChecks: true },
          );

        const workspaceMembers = await workspaceMemberRepository.find({
          where: { userId: In(userIds) },
        });

        return new Map(
          workspaceMembers.map((workspaceMember) => [
            workspaceMember.userId,
            workspaceMember.id,
          ]),
        );
      },
      authContext,
    );
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
    const calendarChannel = await this.repository.findOne({
      where: { id, workspaceId },
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
      { id, workspaceId },
      data as Record<string, unknown>,
    );

    return this.repository.findOneOrFail({ where: { id, workspaceId } });
  }

  async delete({
    id,
    workspaceId,
  }: {
    id: string;
    workspaceId: string;
  }): Promise<CalendarChannelDTO> {
    const calendarChannel = await this.repository.findOneOrFail({
      where: { id, workspaceId },
    });

    await this.repository.delete({ id, workspaceId });

    this.workspaceEventEmitter.emitCustomBatchEvent<CalendarChannelDeletedEvent>(
      CALENDAR_CHANNEL_DELETED_EVENT,
      [{ calendarChannelId: id }],
      workspaceId,
    );

    return calendarChannel;
  }
}
