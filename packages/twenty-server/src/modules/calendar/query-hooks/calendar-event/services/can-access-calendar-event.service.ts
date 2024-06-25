import { ForbiddenException, Injectable } from '@nestjs/common';

import groupBy from 'lodash.groupby';
import { Any } from 'typeorm';

import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { InjectWorkspaceRepository } from 'src/engine/twenty-orm/decorators/inject-workspace-repository.decorator';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { CalendarChannelEventAssociationWorkspaceEntity } from 'src/modules/calendar/standard-objects/calendar-channel-event-association.workspace-entity';
import {
  CalendarChannelWorkspaceEntity,
  CalendarChannelVisibility,
} from 'src/modules/calendar/standard-objects/calendar-channel.workspace-entity';
import { ConnectedAccountRepository } from 'src/modules/connected-account/repositories/connected-account.repository';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { WorkspaceMemberRepository } from 'src/modules/workspace-member/repositories/workspace-member.repository';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Injectable()
export class CanAccessCalendarEventService {
  constructor(
    @InjectWorkspaceRepository(CalendarChannelWorkspaceEntity)
    private readonly calendarChannelRepository: WorkspaceRepository<CalendarChannelWorkspaceEntity>,
    @InjectObjectMetadataRepository(ConnectedAccountWorkspaceEntity)
    private readonly connectedAccountRepository: ConnectedAccountRepository,
    @InjectObjectMetadataRepository(WorkspaceMemberWorkspaceEntity)
    private readonly workspaceMemberService: WorkspaceMemberRepository,
  ) {}

  public async canAccessCalendarEvent(
    userId: string,
    workspaceId: string,
    calendarChannelCalendarEventAssociations: CalendarChannelEventAssociationWorkspaceEntity[],
  ) {
    const calendarChannels = await this.calendarChannelRepository.find({
      where: {
        id: Any(
          calendarChannelCalendarEventAssociations.map(
            (association) => association.calendarChannel.id,
          ),
        ),
      },
    });

    const calendarChannelsGroupByVisibility = groupBy(
      calendarChannels,
      (channel) => channel.visibility,
    );

    if (
      calendarChannelsGroupByVisibility[
        CalendarChannelVisibility.SHARE_EVERYTHING
      ]
    ) {
      return;
    }

    const currentWorkspaceMember =
      await this.workspaceMemberService.getByIdOrFail(userId, workspaceId);

    const calendarChannelsConnectedAccounts =
      await this.connectedAccountRepository.getByIds(
        calendarChannels.map((channel) => channel.connectedAccountId),
        workspaceId,
      );

    const calendarChannelsWorkspaceMemberIds =
      calendarChannelsConnectedAccounts.map(
        (connectedAccount) => connectedAccount.accountOwnerId,
      );

    if (
      calendarChannelsWorkspaceMemberIds.includes(currentWorkspaceMember.id)
    ) {
      return;
    }

    throw new ForbiddenException();
  }
}
