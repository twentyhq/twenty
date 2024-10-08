import { ForbiddenException, Injectable } from '@nestjs/common';

import groupBy from 'lodash.groupby';
import { Any } from 'typeorm';

import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { CalendarChannelEventAssociationWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel-event-association.workspace-entity';
import { CalendarChannelVisibility } from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { WorkspaceMemberRepository } from 'src/modules/workspace-member/repositories/workspace-member.repository';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Injectable()
export class CanAccessCalendarEventService {
  constructor(
    private readonly twentyORMManager: TwentyORMManager,
    @InjectObjectMetadataRepository(WorkspaceMemberWorkspaceEntity)
    private readonly workspaceMemberService: WorkspaceMemberRepository,
  ) {}

  public async canAccessCalendarEvent(
    userId: string,
    workspaceId: string,
    calendarChannelCalendarEventAssociations: CalendarChannelEventAssociationWorkspaceEntity[],
  ) {
    const calendarChannels = calendarChannelCalendarEventAssociations.map(
      (association) => association.calendarChannel,
    );

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

    const connectedAccountRepository =
      await this.twentyORMManager.getRepository<ConnectedAccountWorkspaceEntity>(
        'connectedAccount',
      );

    const connectedAccounts = await connectedAccountRepository.find({
      select: ['id'],
      where: {
        calendarChannels: Any(calendarChannels.map((channel) => channel.id)),
        accountOwnerId: currentWorkspaceMember.id,
      },
    });

    if (connectedAccounts.length > 0) {
      return;
    }

    throw new ForbiddenException();
  }
}
